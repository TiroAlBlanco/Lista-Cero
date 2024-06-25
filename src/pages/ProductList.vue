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
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'ProductList',
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const products = ref([])
    const columns = ref([])
    const highlightedRows = ref([])

    const loadProducts = () => {
      const productList = JSON.parse(localStorage.getItem('productList'))
      const savedHighlightedRows = JSON.parse(localStorage.getItem('highlightedRows'))

      if (productList && productList.length > 0) {
        products.value = productList

        const keys = Object.keys(productList[0])
        columns.value = keys.map(key => ({
          name: key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          align: 'left',
          field: key
        }))
      }

      if (savedHighlightedRows) {
        highlightedRows.value = savedHighlightedRows.map(row => products.value.find(product => product['Código EAN/UPC'] === row['Código EAN/UPC']))
      }
    }

    onMounted(() => {
      loadProducts()
      document.addEventListener('backbutton', onBackButton, false)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('backbutton', onBackButton, false)
    })

    watch(highlightedRows, (newVal) => {
      localStorage.setItem('highlightedRows', JSON.stringify(newVal.map(row => ({
        'Código EAN/UPC': row['Código EAN/UPC']
      }))))
    }, { deep: true })

    // const scanBarcode = () => {
    //   if (window.cordova && window.cordova.plugins && window.cordova.plugins.barcodeScanner) {
    //     window.cordova.plugins.barcodeScanner.scan(
    //       (result) => {
    //         if (!result.cancelled) {
    //           const scannedCode = result.text.trim()
    //           const product = products.value.find(p => String(p['Código EAN/UPC']).trim() === scannedCode)
    //           if (product) {
    //             highlightedRows.value.push(product)
    //             localStorage.setItem('highlightedRows', JSON.stringify(highlightedRows.value.map(row => ({
    //               'Código EAN/UPC': row['Código EAN/UPC']
    //             }))))
    //             $q.notify({
    //               type: 'positive',
    //               message: `El código ${scannedCode} está en la lista y tienes que tomar ${product.A001} unidades.`
    //             })
    //           } else {
    //             $q.notify({
    //               type: 'negative',
    //               message: 'Producto no encontrado'
    //             })
    //           }
    //         }
    //       },
    //       (error) => {
    //         $q.notify({
    //           type: 'negative',
    //           message: 'Error al escanear el código de barras'
    //         })
    //       },
    //       {
    //         preferFrontCamera: false,
    //         showFlipCameraButton: true,
    //         showTorchButton: true,
    //         torchOn: false,
    //         saveHistory: true,
    //         prompt: "Coloca el código de barras dentro del área de escaneo",
    //         resultDisplayDuration: 500,
    //         formats: "EAN_8,EAN_13,EAN_14,UPC_A,UPC_E,CODE_39,CODE_93,CODE_128,CODABAR,ITF,QR_CODE,DATA_MATRIX,PDF_417,AZTEC",
    //         orientation: "portrait",
    //         disableAnimations: true,
    //         disableSuccessBeep: false
    //       }
    //     )
    //   } else {
    //     $q.notify({
    //       type: 'negative',
    //       message: 'Barcode scanner no está disponible'
    //     })
    //   }
    // }
    const scanBarcode = () => {
  if (window.cordova && window.cordova.plugins && window.cordova.plugins.barcodeScanner) {
    window.cordova.plugins.barcodeScanner.scan(
      (result) => {
        if (!result.cancelled) {
          const scannedCode = result.text.trim();
          const product = products.value.find(p => String(p['Código EAN/UPC']).trim() === scannedCode);
          if (product) {
            highlightedRows.value.push(product);
            localStorage.setItem('highlightedRows', JSON.stringify(highlightedRows.value.map(row => ({
              'Código EAN/UPC': row['Código EAN/UPC']
            }))));
            $q.notify({
              type: 'positive',
              message: `El código ${scannedCode} está en la lista y tienes que tomar ${product.A001} unidades.`
            });
          } else {
            $q.notify({
              type: 'negative',
              message: 'Producto no encontrado'
            });
          }
        }
      },
      (error) => {
        $q.notify({
          type: 'negative',
          message: 'Error al escanear el código de barras'
        });
      },
      {
        preferFrontCamera: false,
        showFlipCameraButton: true,
        showTorchButton: true,
        torchOn: false,
        saveHistory: true,
        prompt: "Coloca el código de barras dentro del área de escaneo",
        resultDisplayDuration: 500,
        formats: "EAN_13,EAN_8,EAN_14,UPC_A,UPC_E,CODE_39,CODE_93,CODE_128,CODABAR,ITF,QR_CODE,DATA_MATRIX,PDF_417,AZTEC",
        orientation: "portrait",
        disableAnimations: true,
        disableSuccessBeep: false
      }
    );
  } else {
    $q.notify({
      type: 'negative',
      message: 'Barcode scanner no está disponible'
    });
  }
};

    const onBackButton = (event) => {
      event.preventDefault()
      $q.dialog({
        title: 'Confirmar',
        message: '¿Estás seguro de salirte de la lista?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        localStorage.removeItem('highlightedRows')
        router.push('/')
      }).onCancel(() => {
        // Aquí aseguramos que la lista se recargue correctamente
        loadProducts()
        // Volver a la página de ProductList.vue sin perder el estado
        router.push({ path: '/product-list' })
      })
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
  background-color: rgb(59, 241, 68) !important;
}
</style>
