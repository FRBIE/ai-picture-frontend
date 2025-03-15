<template>
  <a-flex justify="space-between">
    <h2>图片管理</h2>
    <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
  </a-flex>
  <a-form layout="inline" :model="searchParams" @finish="doSearch">
    <a-form-item label="关键词" name="searchText">
      <a-input v-model:value="searchParams.searchText" placeholder="从名称和简介搜索" allow-clear />
    </a-form-item>
    <a-form-item label="类型" name="category">
      <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear />
    </a-form-item>
    <a-form-item label="标签" name="tags">
      <a-select
        v-model:value="searchParams.tags"
        mode="tags"
        placeholder="请输入标签"
        style="min-width: 180px"
        allow-clear
      />
    </a-form-item>
    <a-form-item label="审核状态" name="reviewStatus">
      <a-select
        v-model:value="searchParams.reviewStatus"
        :options="PIC_REVIEW_STATUS_OPTIONS"
        placeholder="请输入审核状态"
        style="min-width: 180px"
        allow-clear
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">搜索</a-button>
    </a-form-item>
  </a-form>

  <a-table
    :columns="columns"
    :data-source="dataList"
    :pagination="pagination"
    :scroll="{ x: 'max-content' }"
    @change="doTableChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'url'">
        <a-image :src="record.url" :width="120" />
      </template>
      <!-- 标签 -->
      <template v-if="column.dataIndex === 'tags'">
        <a-space wrap>
          <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{ tag }}</a-tag>
        </a-space>
      </template>
      <!-- 图片信息 -->
      <template v-if="column.dataIndex === 'picInfo'">
        <div>格式：{{ record.picFormat }}</div>
        <div>宽度：{{ record.picWidth }}</div>
        <div>高度：{{ record.picHeight }}</div>
        <div>宽高比：{{ record.picScale }}</div>
        <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
      </template>
      <!-- 审核信息 -->
      <template v-if="column.dataIndex === 'reviewMessage'">
        <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
        <div>审核信息：{{ record.reviewMessage }}</div>
        <div>审核人：{{ record.reviewerId }}</div>
      </template>
      <template v-else-if="column.dataIndex === 'createTime'">
        {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-else-if="column.dataIndex === 'editTime'">
        {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-else-if="column.key === 'action'">
        <a-space wrap>
          <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank"
            >编辑</a-button
          ><a-popconfirm
          title="确定要删除这张图片吗？"
          ok-text="确认"
          cancel-text="取消"
          @confirm="doDelete(record.id)"
        >
          <a-button type="link" danger>删除</a-button>
        </a-popconfirm>
          <a-button
            v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
            type="link"
            @click="showReviewModal(record, PIC_REVIEW_STATUS_ENUM.PASS)"
            >通过
          </a-button>
          <a-button
            v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
            type="link"
            @click="showReviewModal(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
            >拒绝
          </a-button>
        </a-space>
        <a-modal
          v-model:open="reviewVisible"
          :title="`图片审核 - ${PIC_REVIEW_STATUS_MAP[currentReviewStatus]}`"
          @ok="handleReviewConfirm"
          ok-text="确认"
          cancel-text="取消"
        >
          <a-form layout="vertical">
            <a-form-item
              label="审核备注"
              required
              v-if="currentReviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT"
            >
              <a-textarea
                v-model:value="reviewMessage"
                placeholder="请输入拒绝原因"
                :auto-size="{ minRows: 3 }"
              />
            </a-form-item>
            <a-form-item v-else>
              <p>是否确认通过该图片？</p>
            </a-form-item>
          </a-form>
        </a-modal>
      </template>
    </template>
  </a-table>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePictureUsingPost,
  doPictureReviewUsingPost,
  listPictureByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '../../constants/picture'

const reviewVisible = ref(false)
const currentReviewStatus = ref<number>()
const currentId = ref<number>()
const reviewMessage = ref<string>('')

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

//数据
const dataList = ref([])
const total = ref(0)

//搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

//分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

//获取数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

//获取数据
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

//表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageHeader
  fetchData()
}
const doDelete = async (id?: number) => {
  const res = await deletePictureUsingPost({
    id: id,
  })
  if (res.data.code === 0) {
    message.success('删除成功')
  } else {
    message.error('删除失败')
  }
  fetchData()
}
// 审核处理
const showReviewModal = (record: API.Picture, status: number) => {
  currentReviewStatus.value = status
  currentId.value = record.id
  reviewMessage.value = status === PIC_REVIEW_STATUS_ENUM.REJECT ? '' : '管理员审核通过'
  reviewVisible.value = true
}
// 确认审核
const handleReviewConfirm = async () => {
  if (!currentId.value || currentReviewStatus.value === undefined) return

  // 如果是拒绝必须填写原因
  if (currentReviewStatus.value === PIC_REVIEW_STATUS_ENUM.REJECT && !reviewMessage.value.trim()) {
    message.error('拒绝必须填写原因')
    return
  }

  const res = await doPictureReviewUsingPost({
    id: currentId.value,
    reviewStatus: currentReviewStatus.value,
    reviewMessage: reviewMessage.value,
  })

  if (res.data.code === 0) {
    message.success('审核操作成功')
    reviewVisible.value = false
    fetchData()
  } else {
    message.error('审核操作失败：' + res.data.message)
  }
}
// 页面加载时请求一次  钩子
onMounted(() => {
  fetchData()
})
</script>
<style scoped></style>
