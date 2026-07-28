// Rodízio exato de WhatsApp entre Junior e Josmair para os botões
// "Quero economizar" da página energia-por-assinatura.html.
//
// Guarda um contador no Netlify Blobs. A cada chamada:
//  - lê o contador atual (consistência forte, pra não ler valor desatualizado)
//  - decide o número (par -> Junior, ímpar -> Josmair)
//  - incrementa e salva
//
// Se o Blobs falhar por qualquer motivo (ex.: indisponibilidade),
// devolve sempre o número do Junior — mesmo comportamento que o site
// já tinha antes desta automação, então nada quebra.

import { getStore } from "@netlify/blobs";

const NUMBERS = [
  "5541984738591", // Junior
  "5541998308282", // Josmair
];

export default async () => {
  let number = NUMBERS[0];
  let debug = null;

  try {
    const store = getStore({ name: "whatsapp-round-robin", consistency: "strong" });
    const raw = await store.get("counter-economizar");
    const count = raw ? parseInt(raw, 10) || 0 : 0;
    number = NUMBERS[count % NUMBERS.length];
    await store.set("counter-economizar", String(count + 1));
    debug = { raw, count };
  } catch (err) {
    // TEMPORÁRIO: expõe o erro pra diagnosticar. Tirar depois de confirmar que funciona.
    number = NUMBERS[0];
    debug = { error: String((err && err.message) || err) };
  }

  return new Response(JSON.stringify({ number, debug }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
};
