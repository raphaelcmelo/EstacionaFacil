import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <i className="material-icons mr-2">garage</i>
              <h2 className="text-lg font-bold">EstacionaFácil</h2>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Sistema oficial de estacionamento rotativo municipal. Facilitando
              a gestão de vagas públicas com tecnologia.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
                Ajuda
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Privacidade
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    LGPD
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
                Baixe o App
              </h3>
              <div className="flex flex-col space-y-2">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm flex items-center"
                >
                  <i className="material-icons mr-1 text-sm">android</i>
                  Android
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white text-sm flex items-center"
                >
                  <i className="material-icons mr-1 text-sm">phone_iphone</i>
                  iOS
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-4 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-400">
            &copy; 2025 Prefeitura Municipal. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="material-icons">facebook</i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="material-icons">whatsapp</i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="material-icons">email</i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
