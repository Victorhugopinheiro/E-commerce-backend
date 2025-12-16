API RESTful desenvolvida para sustentar as operações de um e-commerce de alta performance. O foco principal deste projeto foi a aplicação de Clean Code e a implementação de uma arquitetura escalável utilizando o padrão MVC (Model-View-Controller) com uma camada adicional de Services.

Destaques Técnicos
Arquitetura de Camadas: Separação total da lógica de negócio (Services) das interfaces de entrada (Controllers), facilitando testes e manutenção.

Segurança: Implementação de autenticação robusta utilizando JWT (JSON Web Tokens) e criptografia de senhas com Bcrypt.

Gestão de Mídia: Integração com o Cloudinary para processamento e armazenamento de imagens na nuvem.

Banco de Dados: Modelagem de dados com Mongoose (MongoDB) para alta flexibilidade de esquemas.

Tecnologias Utilizadas
Node.js & TypeScript

Express.js

MongoDB & Mongoose

Cloudinary API

CORS, Dotenv, Multer

# 🚀 Backend Commerce API

Esta é uma API RESTful robusta desenvolvida para gerenciar as operações de uma plataforma de e-commerce. O projeto foi construído com foco em **Clean Code**, escalabilidade e segurança.



## 🛠️ Tecnologias
- **Node.js & TypeScript**
- **Express.js** (Framework web)
- **MongoDB & Mongoose** (Banco de dados NoSQL)
- **JWT & Bcrypt** (Autenticação e segurança)
- **Cloudinary** (Armazenamento de imagens na nuvem)

## 🏗️ Arquitetura
A aplicação utiliza o padrão **MVC (Model-View-Controller)** com uma camada adicional de **Services** para separar a lógica de negócio das rotas.
- **Models:** Definição dos esquemas de dados.
- **Services:** Regras de negócio e integração com banco de dados.
- **Controllers:** Gerenciamento de entradas/saídas HTTP.
- **Routes:** Definição dos endpoints da API.

## ⚙️ Como rodar o projeto
1. Clone o repositório.
2. Instale as dependências: `npm install`.
3. Configure o arquivo `.env` (MONGODB_URI, JWT_SECRET, CLOUDINARY_vars).
4. Inicie o servidor: `npm run dev`.
