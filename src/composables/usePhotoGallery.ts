import { ref, onMounted, watch } from 'vue';
import { Camera, CameraPhoto, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor, Plugins } from '@capacitor/core';
import { Storage } from '@capacitor/storage';

export interface Photo {
    filepath: string;
    webviewPath?: string;
}

export function usePhotoGallery(){
    const PHOTO_STORAGE ="photos";
    const { Camera, Filesystem, Storage } = Plugins;
    const photos = ref<Photo[]>([]);

    const cachePhotos = () => {
        Storage.set({
            key: PHOTO_STORAGE.replace,
            value: JSON.stringify(photos.value)
        })
    }

    watch(photos, cachePhotos);

    const loadSaved = async () => {
        const PhotoList = await Storage.get({key: PHOTO_STORAGE});
        const photosInStorage = PhotoList.value ? JSON.parse(PhotoList.value) : [];
        
        photos.value = photosInStorage;
    }

    onMounted(loadSaved);
    
    const takePhoto = async () => {
        const cameraPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100
        });
        const fileName= new Date().getTime() + '.jpeg';
        const savedFileImage = await savePicture(cameraPhoto, fileName);
        photos.value = [savedFileImage, ...photos.value]
    };  
    
    const savePicture = async (photo: CameraPhoto, fileName: string): Promise<Photo> => {
        let base64Data: string;
        
        const file = await Filesystem.readFile({
            path: photo.path!
        });
        base64Data = file.data;
    
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data
        });

        return {
            filepath: savedFile.uri,
            webviewPath: Capacitor.convertFileSrc(savedFile.uri)
        };
    }

      

    return {
        photos,
        takePhoto
    }
    
}

