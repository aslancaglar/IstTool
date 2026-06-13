import { Id } from "../_generated/dataModel";

type StorageReader = {
    getUrl: (storageId: Id<"_storage">) => Promise<string | null>;
};

type ContextWithStorage = {
    storage: StorageReader;
};

interface ItemWithImage {
    imageStorageId?: Id<"_storage">;
    image?: string;
}

/**
 * Resolves an image URL from a storage ID or falls back to the image string.
 * Use this when fetching menu items to convert storage IDs to public URLs.
 */
export async function resolveImageUrl(
    ctx: ContextWithStorage,
    item: ItemWithImage
): Promise<string> {
    if (item.imageStorageId) {
        const url = await ctx.storage.getUrl(item.imageStorageId);
        if (url) return url;
    }
    return item.image || "";
}

/**
 * Maps an array of items with images to include resolved URLs.
 */
export async function resolveItemsWithImages<T extends ItemWithImage>(
    ctx: ContextWithStorage,
    items: T[]
): Promise<(T & { image: string })[]> {
    return Promise.all(
        items.map(async (item) => ({
            ...item,
            image: await resolveImageUrl(ctx, item),
        }))
    );
}
