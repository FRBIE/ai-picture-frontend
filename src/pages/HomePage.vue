<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        placeholder="从海量图片中搜索"
        v-model:value="searchParams.searchText"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 分类 -->
    <div class="category-bar">
      <a-tabs v-model:activeKey="selectedCategory" @change="doSearch" class="custom-tabs">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
      </a-tabs>
    </div>
    <!-- 标签 -->
    <div class="tag-bar">
      <span class="tag-label">标签：</span>
      <div class="tag-container">
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
          class="custom-tag"
        >
          {{ tag }}
        </a-checkable-tag>
      </div>
    </div>
    <div style="margin-bottom: 16px" />
    <!-- 图片列表 -->
    <PictureList :dataList="dataList" :loading="loading" />
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
    />
  </div>
</template>
<script setup lang="ts">
// 数据
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
  listPictureVoByPageWithCacheUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import PictureList from '@/components/PictureList.vue' // 定义数据
const dataList = ref([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams,
    tags: [],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

const doSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<string[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式
    categoryList.value = res.data.data.categoryList ?? []
    tagList.value = res.data.data.tagList ?? []
  } else {
    message.error('加载分类标签失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

.category-bar {
  margin-bottom: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.custom-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
  padding: 0 8px;
}

.custom-tabs :deep(.ant-tabs-tab) {
  padding: 12px 16px;
  font-size: 15px;
  transition: all 0.3s;
}

.custom-tabs :deep(.ant-tabs-tab-active) {
  font-weight: 600;
}

.custom-tabs :deep(.ant-tabs-ink-bar) {
  height: 3px;
  border-radius: 3px;
  background: #1677ff;
}

.tag-bar {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: flex-start;
}

.tag-label {
  margin-right: 8px;
  font-weight: 500;
  color: #333;
  flex-shrink: 0;
  padding-top: 4px;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.custom-tag {
  border-radius: 16px;
  padding: 2px 12px;
  margin-right: 0;
  transition: all 0.3s;
  border: 1px solid #d9d9d9;
  background-color: #fff;
}

.custom-tag:hover {
  color: #1677ff;
  border-color: #1677ff;
}

/* 移除旧的选择器并使用新的方式 */
:deep(.ant-tag.ant-tag-checkable) {
  color: rgba(0, 0, 0, 0.85);
}

:deep(.ant-tag.ant-tag-checkable-checked) {
  background-color: #1677ff;
  color: #ffffff;
  border-color: #1677ff;
}
</style>
