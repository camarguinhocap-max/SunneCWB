// Rodízio exato de WhatsApp entre o CRM e o Junior para os botões
// "Quero economizar" da página energia-por-assinatura.html.
//
// Guarda um contador no Netlify Blobs. A cada chamada:
//  - lê o contador atual (consistência forte, pra não ler valor desatualizado)
//  - decide o número (par -> CRM, ímpar -> Junior)
//  - incrementa e salva
//
// Se o Blobs falhar por qualquer motivo (ex.: indisponibilidade),
// devolve sempre o número do CRM — mesmo comportamento do resto do site,
// que agora tem o CRM como número principal em todos os botões.

import { getStore } from "@netlify/blobs";

const NUMBERS = [
  "5541999594737", // CRM
  "5541984738591", // Junior
];

export default async () => {
  let number = NUMBERS[0];

  try {
    const store = getStore({ name: "whatsapp-round-robin", consistency: "strong" });
    const raw = await store.get("counter-economizar");
    const count = raw ? parseInt(raw, 10) || 0 : 0;
    number = NUMBERS[count % NUMBERS.length];
    await store.set("counter-economizar", String(count + 1));
  } catch (err) {
    // Mantém o fallback (Junior) se algo der errado com o Blobs.
    number = NUMBERS[0];
  }

  return new Response(JSON.stringify({ number }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
};
