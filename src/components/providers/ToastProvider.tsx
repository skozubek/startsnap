/**
 * src/components/providers/ToastProvider.tsx
 * @description Toast notification provider using Sonner with neobrutalist styling
 */

import { Toaster } from 'sonner'
import './toast-styles.css'

/**
 * Provides a toast notification context with custom neobrutalist styling consistent with the StartSnap design system.
 *
 * Renders a configured `Toaster` component that displays toast notifications in the top-right corner with custom styles and color schemes for different toast types.
 *
 * @returns The configured `Toaster` React element.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      duration={4000}
      toastOptions={{
        style: {
          border: '1px solid #1f2937',
          borderRadius: '6px',
          boxShadow: '2px 2px 0px #1f2937',
          fontSize: '13px',
          fontWeight: '500',
          padding: '8px 24px 8px 12px',
          minHeight: '44px',
          position: 'relative'
        },
        className: 'startsnap-toast',
        // Success toast styling
        classNames: {
          success: 'bg-startsnap-mountain-meadow text-white border-gray-800',
          error: 'bg-startsnap-french-rose text-white border-gray-800',
          warning: 'bg-startsnap-corn text-startsnap-ebony-clay border-gray-800',
          info: 'bg-startsnap-french-pass text-startsnap-persian-blue border-gray-800',
          default: 'bg-startsnap-white text-startsnap-ebony-clay border-gray-800',
          closeButton: 'startsnap-close-button'
        }
      }}
    />
  )
}