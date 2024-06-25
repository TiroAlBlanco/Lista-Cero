import { onMounted, onBeforeUnmount } from 'vue'

export function useBackButton(handler) {
  const onBackButton = (event) => {
    event.preventDefault()
    console.log('Se presionó el botón de retroceso (useBackButton)')
    handler()
  }

  onMounted(() => {
    document.addEventListener('backbutton', onBackButton, false)
    console.log('Manejador de botón de retroceso montado')
  })

  onBeforeUnmount(() => {
    document.removeEventListener('backbutton', onBackButton, false)
    console.log('Manejador de botón de retroceso desmontado')
  })
}
