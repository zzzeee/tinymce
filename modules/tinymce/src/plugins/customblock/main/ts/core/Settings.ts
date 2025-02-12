export interface DialogData {
  // ... existing code ...
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  // ... existing code ...
}

export const getDefaultConfig = (): DialogData => ({
  // ... existing code ...
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  // ... existing code ...
});