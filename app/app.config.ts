export default defineAppConfig({
  // https://ui.nuxt.com/getting-started/theme#design-system
  ui: {
    colors: {
      // Чёрно-белая палитра
      primary: 'zinc',
      neutral: 'zinc',
    },
    button: {
      defaultVariants: {
        // Минимализм: нейтральные кнопки по умолчанию
        color: 'neutral',
        variant: 'solid'
      }
    }
  }
})
