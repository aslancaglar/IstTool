import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
import { hashPassword } from "./lib/auth";

export const generatePasswordResetToken = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      // Return null rather than throwing to avoid leaking user existence
      return null;
    }

    // Generate a random 32-byte token
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    const token = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Hash the token for storage
    const tokenBuffer = new TextEncoder().encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", tokenBuffer);
    const tokenHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Expiration time: 1 hour from now
    const expiresAt = Date.now() + 60 * 60 * 1000;

    await ctx.db.insert("passwordResets", {
      userId: user._id,
      tokenHash,
      createdAt: Date.now(),
      expiresAt,
    });

    return { token, email: user.email, name: user.firstName };
  },
});

export const requestPasswordReset = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error("La configuration de l'envoi d'email (RESEND_API_KEY) est manquante.");
    }

    const resend = new Resend(resendApiKey);

    // Call the mutation to generate the token
    const result = await ctx.runMutation(api.passwordReset.generatePasswordResetToken, {
      email: args.email,
    });

    if (!result) {
      // If user doesn't exist, we just return success to avoid email enumeration
      return { success: true };
    }

    // Determine the base URL for the reset link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${result.token}`;

    try {
      const { data, error } = await resend.emails.send({
        from: "Resto Istanbul <noreply@restoistanbultoul.fr>", // This must exactly match your verified domain
        to: result.email,
        subject: "Réinitialisation de votre mot de passe - Resto Istanbul",
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h2>Bonjour ${result.name},</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe sur Resto Istanbul.</p>
            <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
            <div style="margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #eab308; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p>Ce lien est valide pendant 1 heure.</p>
            <p>Si vous n'avez pas demandé de réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
            <p style="color: #666; font-size: 12px;">Resto Istanbul - Toul</p>
          </div>
        `,
      });
      
      if (error) {
        console.error("Resend API error:", error);
        throw new Error("L'API d'email a refusé l'envoi. Avez-vous vérifié votre domaine sur Resend ?");
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Failed to send password reset email:", error);
      // If it's an error we threw above, keep its message
      const msg = error.message || "Erreur lors de l'envoi de l'email de réinitialisation.";
      throw new Error(msg);
    }
  },
});

export const resetPasswordWithToken = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.newPassword.length < 8) {
      throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
    }

    const tokenBuffer = new TextEncoder().encode(args.token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", tokenBuffer);
    const tokenHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const resetRecord = await ctx.db
      .query("passwordResets")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .first();

    if (!resetRecord) {
      throw new Error("Le lien de réinitialisation est invalide ou a expiré.");
    }

    if (resetRecord.expiresAt < Date.now()) {
      await ctx.db.delete(resetRecord._id);
      throw new Error("Le lien de réinitialisation a expiré.");
    }

    const user = await ctx.db.get(resetRecord.userId);
    if (!user) {
      throw new Error("Utilisateur introuvable.");
    }

    const passwordHash = await hashPassword(args.newPassword);
    
    // Update user password
    await ctx.db.patch(user._id, { passwordHash });

    // Delete the used reset token
    await ctx.db.delete(resetRecord._id);

    // Optional: revoke all existing sessions to force login with new password
    const sessions = await ctx.db
      .query("userSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    return true;
  },
});
