<template>
  <div class="url-picture-upload">
    <a-input-group compact style="margin-bottom: 16px">
      <a-input v-model:value="fileUrl" style="width: calc(100% - 120px)" placeholder="请输入图片URL"/>
      <a-button type="primary" :loading="loading" @click="handleUpload" style="width: 120px">Submit</a-button>
    </a-input-group>
    <img v-if="picture?.url" :src="picture?.url" alt="picture" style="margin: 0 auto">
  </div>
</template>
<script lang="ts" setup>
import {ref} from 'vue'
import {PlusOutlined, LoadingOutlined} from '@ant-design/icons-vue'
import {message} from 'ant-design-vue'
import type {UploadProps} from 'ant-design-vue'
import {uploadPictureByUrlUsingPost, uploadPictureUsingPost} from "@/api/pictureController";

interface Props {
  picture?: API.PictureVO
  onSuccess?: (newPicture: API.PictureVO) => void
}
const props = defineProps<Props>()
const fileUrl = ref<String>()
const loading = ref<boolean>(false)



const handleUpload = async () => {
  loading.value = true
  try {
    const params : API.PictureUploadRequest = {fileUrl: fileUrl.value}
    if(props.picture){
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      //将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error("图片上传失败," + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.picture-upload img {
  max-width: 100%;
  max-height: 480px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}

</style>
