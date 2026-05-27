export const validarSenha = (senhaTexto) => {
  if (senhaTexto.length !== 8) {
    return false;
  }
  return true;
};