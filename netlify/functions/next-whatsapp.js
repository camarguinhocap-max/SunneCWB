// ATENCAO: este arquivo esta DUPLICADO com next-whatsapp.mjs (mesmo nome de
// funcao, extensoes diferentes). Ele deveria ter sido apagado — precisa
// deletar manualmente pelo Explorer do Windows (o sandbox nao consegue
// apagar arquivos neste mount). Ate isso ser feito, mantendo o numero
// igual ao do .mjs pra nao haver risco de foto de rodizio divergente.
//
// Rodízio exato de WhatsApp entre Junior e o CRM para os botões
// "Quero economizar" da página energia-por-assinatura.html.
//
// Guarda um contador no Netlify Blobs. A cada chamada:
//  - lê o contador atual
//  - decide o número (par -> Junior, ímpar -> CRM)
//  - incrementa e salva
//
// Se o Blobs falhar por qualquer motivo (ex.: indisponibilidade),
// devolve sempre o número do Junior — mesmo comportamento que o site
// já tinha antes desta automação, então nada quebra.

const { getStore, connectLambda } = require("@netlify/blobs");

const NUMBERS = [
  "5541984738591", // Junior
  "5541999594737", // CRM
];

exports.handler = async (event) => {
  // Necessário no modo "Lambda compatibility": sem isso, o Blobs não sabe
  // em qual site/deploy está rodando (erro MissingBlobsEnvironmentError).
  connectLambda(event);

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
    debug = { error: String(err && err.message || err) };
  }

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({ number, debug }),
  };
};
