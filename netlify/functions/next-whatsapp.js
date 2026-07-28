// Rodízio exato de WhatsApp entre Junior e Josmair para os botões
// "Quero economizar" da página energia-por-assinatura.html.
//
// Guarda um contador no Netlify Blobs. A cada chamada:
//  - lê o contador atual
//  - decide o número (par -> Junior, ímpar -> Josmair)
//  - incrementa e salva
//
// Se o Blobs falhar por qualquer motivo (ex.: indisponibilidade),
// devolve sempre o número do Junior — mesmo comportamento que o site
// já tinha antes desta automação, então nada quebra.

const { getStore } = require("@netlify/blobs");

const NUMBERS = [
  "5541984738591", // Junior
  "5541998308282", // Josmair
];

exports.handler = async () => {
  let number = NUMBERS[0];

  try {
    const store = getStore("whatsapp-round-robin");
    const raw = await store.get("counter-economizar");
    const count = raw ? parseInt(raw, 10) || 0 : 0;
    number = NUMBERS[count % NUMBERS.length];
    await store.set("counter-economizar", String(count + 1));
  } catch (err) {
    // Mantém o fallback (Junior) se algo der errado com o Blobs.
    number = NUMBERS[0];
  }

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({ number }),
  };
};
