<template>
  <q-page class="q-pa-md">
    <q-toolbar class="q-mb-none">
      <q-toolbar-title class="q-pa-md text-center q-mt-none q-mb-none">
        Lista de Productos
      </q-toolbar-title>
    </q-toolbar>

    <q-page-container>
      <q-page class="q-pa-md q-pt-none q-mt-none">
        <div class="q-mb-md text-center">
          <q-btn color="primary" label="Escanear Código EAN-13" @click="scanBarcode" />
        </div>
        <q-table
          :rows="products"
          :columns="columns"
          row-key="id"
          flat
          dense
          :rows-per-page-options="[0]"
          class="q-mt-none"
        >
          <template v-for="column in columns" :key="column.name" v-slot:[`body-cell-${column.name}`]="props">
            <q-td :props="props" :class="{ 'highlight': isHighlighted(props.row) }">
              {{ props.row[column.name] }}
            </q-td>
          </template>
        </q-table>
      </q-page>
    </q-page-container>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'ProductList',
  setup() {
    const $q = useQuasar()
    const products = ref([])
    const columns = ref([])
    const highlightedRows = ref([])

    onMounted(() => {
      const productList = JSON.parse(localStorage.getItem('productList'))
      if (productList && productList.length > 0) {
        products.value = productList

        // Obtener los encabezados de las columnas dinámicamente
        const keys = Object.keys(productList[0])
        columns.value = keys.map(key => ({
          name: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          align: 'left',
          field: key
        }))
      }

      document.addEventListener('backbutton', onBackButton, false)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('backbutton', onBackButton, false)
    })

    const scanBarcode = () => {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.barcodeScanner) {
        window.cordova.plugins.barcodeScanner.scan(
          (result) => {
            if (!result.cancelled) {
              const scannedCode = result.text.trim()
              const product = products.value.find(p => String(p['Código EAN/UPC']).trim() === scannedCode)
              if (product) {
                highlightedRows.value.push(product)
                $q.notify({
                  type: 'positive',
                  message: `El código ${scannedCode} está en la lista y tienes que tomar ${product.A007} unidades.`
                })
              } else {
                $q.notify({
                  type: 'negative',
                  message: 'Producto no encontrado'
                })
              }
            }
          },
          (error) => {
            $q.notify({
              type: 'negative',
              message: 'Error al escanear el código de barras'
            })
          },
          {
            preferFrontCamera: false, // Use the back camera
            showFlipCameraButton: true, // Show flip camera button
            showTorchButton: true, // Show torch button
            torchOn: false, // Start with the torch off
            saveHistory: true, // Save scan history
            prompt: "Coloca el código de barras dentro del área de escaneo", // Android
            resultDisplayDuration: 500, // Milliseconds to display scanned text
            formats: "EAN_13", // Default: all but PDF_417 and RSS_EXPANDED
            orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations: true, // iOS
            disableSuccessBeep: false // iOS and Android
          }
        )
      } else {
        $q.notify({
          type: 'negative',
          message: 'Barcode scanner no está disponible'
        })
      }
    }

    const onBackButton = (event) => {
      event.preventDefault()
      navigator.notification.confirm(
        '¿Estás seguro de salirte de la lista?',
        (buttonIndex) => {
          if (buttonIndex === 1) {
            history.back()  // Usar history.back() para retroceder
          }
        },
        'Confirmar',
        ['Sí', 'No']
      )
    }

    const isHighlighted = (row) => {
      return highlightedRows.value.includes(row)
    }

    return {
      products,
      columns,
      scanBarcode,
      isHighlighted
    }
  }
})
</script>

<style>
.q-page {
  background: #ffffff;
}
.q-page-container {
  height: 100%;
  overflow-y: auto;
}
.q-mt-none {
  margin-top: 0 !important;
}
.q-mb-none {
  margin-bottom: 0 !important;
}
.q-pt-none {
  padding-top: 0 !important;
}
.q-pa-md {
  padding: 0 !important;
}
.q-mb-md {
  margin-bottom: 16px;
}
.highlight {
  background-color: yellow !important;
}
</style>
