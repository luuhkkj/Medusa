# Chaveiro de Segurança – Rotas Seguras

Dispositivo de segurança pessoal em formato de chaveiro que se conecta a um aplicativo móvel para enviar alertas de emergência, compartilhar localização em tempo real e alimentar um mapa colaborativo de áreas de risco para mulheres.

---

## Objetivo

Este projeto acadêmico integra **hardware embarcado**, **aplicativo móvel** e **backend simples** para:

- Registrar eventos de perigo com um botão físico (2 ou 3 cliques).
- Avisar contatos de confiança e ligar para a polícia usando o celular.
- Compartilhar a localização em tempo real, similar a apps de rastreamento.
- Mapear pontos perigosos na cidade a partir dos relatos dos usuários.

---

## Funcionalidades principais

### Dispositivo (chaveiro)

- Formato de chaveiro com corpo impresso em 3D e compartimento para spray de pimenta.
- Botão único com múltiplas funções:
  - **2 cliques:** envia mensagem de emergência para contatos com localização em tempo real.
  - **3 cliques:** solicita ao app que ligue para o número de emergência (ex.: 190).
- LED e vibração para indicar estados (ligado, conectado, alerta enviado, bateria baixa).

### Aplicativo móvel

- Pareamento via **Bluetooth** com o dispositivo.
- Cadastro de contatos de confiança.
- Envio automático de mensagens de emergência com localização.
- Ligação para a polícia em eventos críticos (3 cliques).
- Mapa em tempo real mostrando a posição da pessoa (rota tipo “Uber”).

### Backend e mapa web

- API para receber eventos de perigo (tipo, horário, localização, batimentos).
- Banco de dados com dados anonimizados.
- Mapa de calor e estatísticas por região para análise de rotas seguras.

---

## Autoria

Projeto desenvolvido por: 
AMANDA DA SILVA SANTOS
BIANCA DOS SANTOS FERREIRA
LARISSA MALAQUIAS DE CARVALHO
RAQUEL DA SILVA PINTO SANTANA
YAN LUCAS CUNHA SANTA IZABEL
Como trabalho acadêmico na área de sistemas embarcados, IoT e segurança pessoal.
