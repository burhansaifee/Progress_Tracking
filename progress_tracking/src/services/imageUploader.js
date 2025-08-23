const IMGBB_API_KEY = 'fa381ce066c51f4aefe416cd6ae11072';

export const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image upload failed: ${errorText}`);
    }

    const result = await response.json();
    if (!result.success) {
        throw new Error(`ImgBB Error: ${result.error.message}`);
    }

    return result.data.url;
};