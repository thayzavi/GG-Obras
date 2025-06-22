# 📱 GG-Obras - App de Cadastro e Monitoramento de Obras

Aplicativo mobile para registrar e acompanhar obras em andamento, com funcionalidades de geolocalização, fotos via câmera, controle de fiscalizações e envio de e-mail.

## 🚀 Tecnologias Utilizadas
- React Native com Expo
- Expo Camera
- Expo Location
- Axios
- React Navigation

  ## 📦 Instalação e Execução
```bash
git clone https://github.com/seu-usuario/GG-obras.git
cd GG-obras
npm install
npx expo start
```
> Aponte o Expo Go no seu celular para o QR Code que aparece no terminal para testar no dispositivo.

## 📲 Funcionalidades
### 👷 Cadastro de Obra
- Nome da obra
- Responsável
- Data de início e previsão de término
- Foto (tirada pela câmera)
- Localização (obtida via GPS)
- Descrição

### 🕵️‍♂️ Cadastro de Fiscalização
- Data da fiscalização
- Status da obra: Em dia, Atrasada, Parada
- Observações
- Localização (GPS)
- Foto da fiscalização
- Relacionada à obra selecionada

### 🧭 Navegação
- Tela **Home**: Lista todas as obras
- Tela **Nova Obra**
- Tela **Detalhes da Obra**
- Tela **Nova Fiscalização**
- Tela **Editar obra e fiscalização**

## 📧 Envio por E-mail
O usuário insere um e-mail e envia as informações completas da obra e suas fiscalizações. O backend usa Nodemailer para isso.

## 🖼️ Captura de Imagens
A captura usa expo-image-picker com base64.

## 📍 Geolocalização
Localização obtida via expo-location ao criar obra ou fiscalização.

## 🧑‍💻 Autor
Desenvolvido por **[Thayza Silva]**
[GitHub](https://github.com/thayzavi)
