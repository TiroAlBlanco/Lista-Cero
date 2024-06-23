<template>
  <q-page class="q-pa-md text-center">
    <div class="q-mt-md">
      <h2>Bienvenidos a Del Sol</h2>
      <img :src="logo" alt="Del Sol" style="width: 250px;">
      <h4>Busca la lista del pedido</h4>
    </div>

    <div class="q-mt-md">
      <q-btn color="primary" label="Cargar Lista Cero" size="large" @click="openFileDialog" />
      <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import logo from '../assets/img/Delsol-logo-simple.png'

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const fileInput = ref(null)

    const openFileDialog = () => {
      fileInput.value.click()
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
        localStorage.setItem('productList', JSON.stringify(worksheet))
        $q.notify({ message: 'Lista cargada exitosamente', type: 'positive',timeout: 500 })
        router.push('/product-list')
      }
      reader.readAsArrayBuffer(file)
    }

    return {
      logo,
      fileInput,
      openFileDialog,
      handleFileUpload
    }
  }
})
</script>

<style>
.q-page {
  background: #ffffff;
}
</style>
