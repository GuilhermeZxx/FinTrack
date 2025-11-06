import { useState } from "react";

export default function Inscricao(props) {
  const [mensagem, setMensagem] = useState(props.conteudo || "");

  function handleClick() {
    setMensagem("Obrigado por se inscrever! Você receberá novidades em breve.");
  }

  return (
    <>
      <h2>ReactJS</h2>
      <p>Inscreva-se para receber conteúdo atualizado</p>
      <button onClick={handleClick}>Quero receber novidades</button>
      <p>{mensagem}</p>
    </>
  );
}
