export type ImageAsset = {
  src: string;
  alt: string;
};

export interface ImageSource {
  resolve(storageKey: string, alt: string): ImageAsset;
}

export const publicImageSource: ImageSource = {
  resolve(storageKey, alt) {
    return { src: storageKey, alt };
  },
};
