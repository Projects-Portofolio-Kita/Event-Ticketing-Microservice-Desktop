/**
 * @file checkout_modal_types.ts
 * @description Type definitions for CheckoutModal props.
 */
import { UserProfile } from '../../types/user';

export interface CheckoutModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onCancel?: () => void;
  user?: UserProfile;
}
