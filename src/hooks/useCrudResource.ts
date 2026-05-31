import { useCallback, useState } from 'react';

type AnyMutation = (args: any) => Promise<any>;

interface UseCrudResourceConfig<TForm, TEntity, TId> {
  /** Admin session token; mutations are skipped while it is missing. */
  adminToken: string | null | undefined;
  /** Builds a fresh form for "create" — called each time the create modal opens
   *  so it can read the latest data (e.g. next displayOrder). */
  emptyForm: () => TForm;
  /** Maps an existing entity into form state for "edit". */
  toForm: (entity: TEntity) => TForm;
  /** Extracts the Convex id from an entity. */
  getId: (entity: TEntity) => TId;
  createMutation: AnyMutation;
  updateMutation: AnyMutation;
  deleteMutation: AnyMutation;
  /** Optional hook for surfacing failures (e.g. an alert/toast). */
  onError?: (action: 'save' | 'delete', error: unknown) => void;
}

/**
 * Encapsulates the create/edit/delete state machine shared by the simple admin
 * CRUD pages (form modal + confirm-delete modal). Pages supply their own field
 * inputs and table markup; this hook owns the wiring.
 */
export function useCrudResource<TForm extends Record<string, any>, TEntity, TId>(
  config: UseCrudResourceConfig<TForm, TEntity, TId>
) {
  const {
    adminToken,
    emptyForm,
    toForm,
    getId,
    createMutation,
    updateMutation,
    deleteMutation,
    onError,
  } = config;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<TId | null>(null);
  const [formData, setFormData] = useState<TForm>(() => emptyForm());
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: TId | null }>({
    isOpen: false,
    id: null,
  });

  const openCreate = useCallback(() => {
    setEditingId(null);
    setFormData(emptyForm());
    setIsModalOpen(true);
  }, [emptyForm]);

  const openEdit = useCallback((entity: TEntity) => {
    setEditingId(getId(entity));
    setFormData(toForm(entity));
    setIsModalOpen(true);
  }, [getId, toForm]);

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const submit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!adminToken) return;
    try {
      if (editingId !== null) {
        await updateMutation({ id: editingId, ...formData, adminToken });
      } else {
        await createMutation({ ...formData, adminToken });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving:', error);
      onError?.('save', error);
    }
  }, [adminToken, editingId, formData, createMutation, updateMutation, onError]);

  const requestDelete = useCallback((id: TId) => setConfirmModal({ isOpen: true, id }), []);
  const cancelDelete = useCallback(() => setConfirmModal({ isOpen: false, id: null }), []);

  const confirmDelete = useCallback(async () => {
    if (confirmModal.id === null || !adminToken) return;
    try {
      await deleteMutation({ id: confirmModal.id, adminToken });
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting:', error);
      onError?.('delete', error);
    }
  }, [confirmModal.id, adminToken, deleteMutation, onError]);

  return {
    isModalOpen,
    editingId,
    formData,
    setFormData,
    openCreate,
    openEdit,
    closeModal,
    submit,
    confirmModal,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
