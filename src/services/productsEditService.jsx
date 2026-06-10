export async function uploadImage(selectedFiles, gtin) {
  try {
    console.log("Arquivos recebidos no SERVICE!! Enviando imagem para o GTIN:", gtin);
    const formData = new FormData();

    formData.append("image", selectedFiles);
    formData.append("gtin", gtin);

 /*/DEBUG === 
        console.log("SERVICES !! image =", selectedFiles.name);
        console.log("SERVICES !! gtin =", gtin);
//*/

    const response = await fetch(`/api/image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("SERVICE ERROR !! Erro ao enviar imagem");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}