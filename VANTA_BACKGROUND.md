# Vanta.js Topology Background

## Implementação

Foi adicionado um efeito de fundo animado usando Vanta.js Topology em toda a aplicação. O efeito é dinâmico e responde ao tema (claro/escuro) da aplicação.

## Arquivos Adicionados

### Bibliotecas JavaScript
- `/public/p5.min.js` - Biblioteca p5.js necessária para o Vanta
- `/public/vanta.topology.min.js` - Efeito Topology do Vanta.js

### Componente React
- `/src/components/VantaBackground.tsx` - Componente que gerencia o efeito Vanta

## Configuração de Cores

O efeito usa cores diferentes dependendo do tema:

### Light Mode
- **Cor primária**: `#E87A3E` (laranja quente, alinhado com a paleta Manduvi)
- **Cor de fundo**: `#F5F5F5` (branco suave)

### Dark Mode
- **Cor primária**: `#E87A3E` (mesma laranja, mantendo consistência)
- **Cor de fundo**: `#1A1A1A` (preto escuro)

## Como Funciona

1. O componente `VantaBackground` é renderizado com `z-index: -10` para ficar atrás de todo o conteúdo
2. Ele monitora mudanças no tema usando `useTheme()`
3. Quando o tema muda, o efeito é atualizado dinamicamente com as novas cores
4. O efeito responde a interações do mouse e touch

## Onde é Usado

O componente foi adicionado em:
- `Layout.tsx` - Para todas as páginas que usam o layout principal
- `LoginPage.tsx` - Página de login
- `RegisterPage.tsx` - Página de registro (todas as etapas)

## Personalização

Para ajustar as cores ou comportamento do efeito, edite o arquivo `/src/components/VantaBackground.tsx`:

```typescript
const lightModeColors = {
  color: 0xE87A3E,        // Cor dos pontos/linhas
  backgroundColor: 0xF5F5F5, // Cor de fundo
};

const darkModeColors = {
  color: 0xE87A3E,        // Cor dos pontos/linhas
  backgroundColor: 0x1A1A1A, // Cor de fundo
};
```

### Outras Opções Disponíveis

Você pode adicionar/modificar estas propriedades no objeto de configuração do VANTA:

```typescript
window.VANTA.TOPOLOGY({
  el: vantaRef.current,
  mouseControls: true,      // Controle por mouse
  touchControls: true,      // Controle por toque
  gyroControls: false,      // Controle por giroscópio
  minHeight: 200.0,         // Altura mínima
  minWidth: 200.0,          // Largura mínima
  scale: 1.0,               // Escala geral
  scaleMobile: 1.0,         // Escala em mobile
  color: 0xE87A3E,          // Cor primária
  backgroundColor: 0x1A1A1A // Cor de fundo
});
```

## Performance

O efeito é renderizado usando WebGL e é otimizado para performance. No entanto, em dispositivos mais antigos ou com hardware limitado, você pode:

1. Desabilitar em mobile ajustando `touchControls: false`
2. Reduzir a escala em mobile: `scaleMobile: 0.5`
3. Adicionar condição para não renderizar em mobile

## Transparência dos Painéis

Os painéis da UI mantêm suas cores originais, mas o efeito de fundo adiciona profundidade visual à interface. Se desejar mais transparência nos painéis para ver melhor o efeito, você pode ajustar as classes do Tailwind:

```jsx
// Em vez de:
className="bg-ui-panel dark:bg-dark-panel"

// Use:
className="bg-ui-panel/95 dark:bg-dark-panel/95"
```

O `/95` adiciona 95% de opacidade, permitindo ver sutilmente o fundo através do painel.

## Desativação

Para remover o efeito:

1. Remova `<VantaBackground />` dos componentes Layout, LoginPage e RegisterPage
2. Remova as tags `<script>` do `index.html`
3. Delete `/src/components/VantaBackground.tsx`
4. Opcionalmente, delete os arquivos JS do `/public`

## Créditos

- **Vanta.js**: https://www.vantajs.com/
- **p5.js**: https://p5js.org/
