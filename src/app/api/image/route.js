import { NextResponse } from "next/server";

export async function POST(request) {
    try {
    const formData = await request.formData();

    const image = formData.get("image");
    const gtin = formData.get("gtin");

        console.log("API TRY !! Recebendo requisição de upload de imagem...");
        console.log("API TRY !! GTIN:", gtin);
        console.log("API TRY !! Arquivo:", image.name);

    if (!image || !gtin) {
      return NextResponse.json(
        { error: "Imagem e GTIN são obrigatórios" },
        { status: 400 }
      );
    }

    // encaminha para sua API de imagens
    const uploadData = new FormData();

    uploadData.append("image", image);
    uploadData.append("gtin", gtin);
    console.log("API NEXT TO GTIN TO IMAGES !! ENVIANDO requisição de upload de imagem...");
    console.log("Enviando para:", process.env.GTIN_API_URL);
    console.log("GTIN:", gtin);
    console.log("Arquivo:", image.name);
 const tokenResponse = await fetch(`${origin}/api/image/token`);
    const tokenData = await tokenResponse.json(); 
    const response = await fetch(
  `${process.env.GTIN_API_URL}/api/upload?token=${tokenData.token}`,
  {
    method: "POST",
    body: uploadData,
  }
);

    const result = await response.json();

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao processar upload" },
      { status: 500 }
    );
  }
}