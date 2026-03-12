<template>
  <div class="vehicle-list">
    <el-page-header :title="'车辆管理'" />
    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>车辆列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增车辆
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="mb-4" style="display:flex;align-items:center;">
        <el-form-item label="车辆编号">
          <el-input v-model="searchForm.vehicleNumber" placeholder="请输入车辆编号" />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="searchForm.brand" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="状态" style="margin-right:10px;">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="可租" :value="1" />
            <el-option label="已租" :value="2" />
            <el-option label="维修中" :value="3" />
            <el-option label="报废" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="vehicleList" style="width:100%">
        <el-table-column prop="vehicleId" label="ID" width="80" />
        <el-table-column prop="vehicleNumber" label="车辆编号" />
        <el-table-column prop="vin" label="车架号" />
        <el-table-column prop="licensePlate" label="车牌号" />
        <el-table-column prop="brand" label="品牌" />
        <el-table-column prop="model" label="型号" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">{{ getVehicleTypeText(row.vehicleType) }}</template>
        </el-table-column>
        <el-table-column label="租金(元/小时)" width="130">
          <template #default="{ row }">¥{{ toMoney(row.price || row.hourlyPrice) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="batteryLevel" label="电量" width="140">
          <template #default="{ row }">
            <el-progress :percentage="Number(row.batteryLevel || 0)" :color="getBatteryColor(Number(row.batteryLevel || 0))" :stroke-width="10" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="760px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="车辆编号" prop="vehicleNumber">
          <el-input v-model="form.vehicleNumber" placeholder="请输入车辆编号" />
        </el-form-item>
        <el-form-item label="车架号" prop="vin">
          <el-input v-model="form.vin" placeholder="请输入车架号" />
        </el-form-item>
        <el-form-item label="车牌号" prop="licensePlate">
          <el-input v-model="form.licensePlate" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="form.brand" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="form.model" placeholder="请输入型号" />
        </el-form-item>
        <el-form-item label="类型" prop="vehicleType">
          <el-select v-model="form.vehicleType" placeholder="请选择类型">
            <el-option label="两轮" :value="1" />
            <el-option label="三轮" :value="2" />
            <el-option label="四轮" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="租金(元/小时)" prop="hourlyPrice">
          <el-input-number v-model="form.hourlyPrice" :min="0" :precision="2" :step="0.5" />
        </el-form-item>
        <el-form-item label="电池类型" prop="batteryType">
          <el-select v-model="form.batteryType" placeholder="请选择电池类型">
            <el-option label="铅酸" :value="1" />
            <el-option label="锂电" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="电池容量(Ah)" prop="batteryCapacity">
          <el-input-number v-model="form.batteryCapacity" :min="0" />
        </el-form-item>
        <el-form-item label="续航里程(km)" prop="rangeMileage">
          <el-input-number v-model="form.rangeMileage" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import http from '@/api/http';

const searchForm = reactive({
  vehicleNumber: '',
  brand: '',
  status: undefined as undefined | number
});

const vehicleList = ref<any[]>([]);
const allVehicleList = ref<any[]>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const dialogVisible = ref(false);
const dialogTitle = ref('新增车辆');
const formRef = ref();
const form = reactive({
  vehicleId: undefined as undefined | number,
  vehicleCode: '',
  vehicleNumber: '',
  vin: '',
  licensePlate: '',
  brand: '',
  model: '',
  vehicleType: 1,
  batteryType: 1,
  batteryCapacity: 0,
  rangeMileage: 0,
  hourlyPrice: 8
});

const rules = {
  vehicleNumber: [{ required: true, message: '请输入车辆编号', trigger: 'blur' }],
  vin: [{ required: true, message: '请输入车架号', trigger: 'blur' }],
  brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  vehicleType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  hourlyPrice: [{ required: true, message: '请输入租金', trigger: 'blur' }]
};

onMounted(() => {
  loadVehicles();
});

async function loadVehicles() {
  const response = await http.get('/api/vehicle/list', {
    params: {
      page: 1,
      size: 2000,
      vehicleNumber: searchForm.vehicleNumber?.trim() || undefined,
      brand: searchForm.brand?.trim() || undefined,
      status: searchForm.status ?? undefined
    }
  });
  allVehicleList.value = response.data || [];
  pagination.total = allVehicleList.value.length;
  applyPagination();
}

function applyPagination() {
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  vehicleList.value = allVehicleList.value.slice(start, end);
}

function handleSearch() {
  pagination.currentPage = 1;
  loadVehicles();
}

function resetSearch() {
  searchForm.vehicleNumber = '';
  searchForm.brand = '';
  searchForm.status = undefined;
  pagination.currentPage = 1;
  loadVehicles();
}

function handleAdd() {
  dialogTitle.value = '新增车辆';
  resetVehicleForm();
  dialogVisible.value = true;
}

function handleEdit(row: any) {
  dialogTitle.value = '编辑车辆';
  form.vehicleId = Number(row.vehicleId);
  form.vehicleCode = row.vehicleCode || '';
  form.vehicleNumber = row.vehicleNumber || '';
  form.vin = row.vin || '';
  form.licensePlate = row.licensePlate || '';
  form.brand = row.brand || '';
  form.model = row.model || '';
  form.vehicleType = Number(row.vehicleType || 1);
  form.batteryType = Number(row.batteryType || 1);
  form.batteryCapacity = Number(row.batteryCapacity || 0);
  form.rangeMileage = Number(row.rangeMileage || row.range || 0);
  form.hourlyPrice = Number(row.hourlyPrice || row.price || 0) || 8;
  dialogVisible.value = true;
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确定删除车辆 ${row.vehicleNumber} 吗？`, '提示', { type: 'warning' });
  await http.delete(`/api/vehicle/${row.vehicleId}`);
  ElMessage.success('删除成功');
  await loadVehicles();
}

async function handleSubmit() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    const payload: any = {
      vehicleCode: form.vehicleCode || `VC${Date.now()}`,
      vehicleNumber: form.vehicleNumber,
      vin: form.vin,
      licensePlate: form.licensePlate || null,
      brand: form.brand,
      model: form.model,
      vehicleType: Number(form.vehicleType),
      batteryType: Number(form.batteryType),
      batteryCapacity: Number(form.batteryCapacity || 0),
      rangeMileage: Number(form.rangeMileage || 0),
      hourlyPrice: Number(form.hourlyPrice || 0),
      status: 1
    };

    try {
      if (form.vehicleId) {
        await http.put(`/api/vehicle/${form.vehicleId}`, { ...payload, vehicleId: form.vehicleId });
      } else {
        await http.post('/api/vehicle/create', payload);
      }
      ElMessage.success('保存成功');
      dialogVisible.value = false;
      await loadVehicles();
    } catch (e: any) {
      const msg = String(e?.response?.data?.message || e?.message || '');
      if (msg.includes('Vehicle number already exists')) {
        ElMessage.error('车辆编号已存在，请更换');
      } else if (msg.includes('VIN already exists')) {
        ElMessage.error('车架号已存在，请更换');
      } else if (msg.includes('License plate already exists')) {
        ElMessage.error('车牌号已存在，请更换');
      } else {
        ElMessage.error('保存失败');
      }
    }
  });
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  applyPagination();
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current;
  applyPagination();
}

function getVehicleTypeText(type: number) {
  return ({ 1: '两轮', 2: '三轮', 3: '四轮' } as Record<number, string>)[type] || '未知';
}

function getStatusText(status: number) {
  return ({ 1: '可租', 2: '已租', 3: '维修中', 4: '报废', 5: '待清洁' } as Record<number, string>)[status] || '未知';
}

function getStatusType(status: number) {
  return ({ 1: 'success', 2: 'warning', 3: 'danger', 4: 'info', 5: 'info' } as Record<number, string>)[status] || 'info';
}

function getBatteryColor(level: number) {
  if (level > 70) return '#67C23A';
  if (level > 30) return '#E6A23C';
  return '#F56C6C';
}

function toMoney(v: any) {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

function resetVehicleForm() {
  form.vehicleId = undefined;
  form.vehicleCode = '';
  form.vehicleNumber = '';
  form.vin = '';
  form.licensePlate = '';
  form.brand = '';
  form.model = '';
  form.vehicleType = 1;
  form.batteryType = 1;
  form.batteryCapacity = 0;
  form.rangeMileage = 0;
  form.hourlyPrice = 8;
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
