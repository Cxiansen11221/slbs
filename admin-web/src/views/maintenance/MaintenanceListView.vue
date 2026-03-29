<template>
  <div class="maintenance-list">
    <el-page-header :title="'维修管理'" />
    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>报修记录</span>
          <el-button type="primary" plain @click="loadRecords">刷新</el-button>
        </div>
      </template>

      <el-table :data="records" v-loading="loading" style="width: 100%">
        <el-table-column prop="maintenanceId" label="ID" width="80" />
        <el-table-column label="车辆" min-width="160">
          <template #default="{ row }">
            {{ resolveVehicleLabel(row.vehicleId) }}
          </template>
        </el-table-column>
        <el-table-column label="故障类型" width="120">
          <template #default="{ row }">{{ faultTypeText(row.faultType) }}</template>
        </el-table-column>
        <el-table-column prop="faultDescription" label="故障描述" min-width="220" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.maintenanceStatus)">{{ statusText(row.maintenanceStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reportTime" label="提交时间" min-width="170" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">处理</el-button>
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

    <el-dialog v-model="dialogVisible" title="处理报修" width="520px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="车辆">
          <el-input v-model="form.vehicleLabel" disabled />
        </el-form-item>
        <el-form-item label="故障类型">
          <el-input v-model="form.faultTypeText" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.maintenanceStatus" placeholder="请选择状态">
            <el-option label="待维修" :value="1" />
            <el-option label="维修中" :value="2" />
            <el-option label="已完成" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.maintenanceNote" type="textarea" rows="3" placeholder="处理说明/备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import http from "@/api/http";
import { fetchMaintenanceList, updateMaintenance, type MaintenanceRecord } from "@/api/modules/maintenance";

type VehicleOption = { vehicleId: number; vehicleNumber?: string; brand?: string; model?: string };

const loading = ref(false);
const records = ref<MaintenanceRecord[]>([]);
const vehicles = ref<VehicleOption[]>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const dialogVisible = ref(false);
const saving = ref(false);
const form = reactive({
  maintenanceId: 0,
  vehicleId: 0,
  vehicleLabel: "",
  faultTypeText: "",
  maintenanceStatus: 1,
  maintenanceNote: ""
});

onMounted(() => {
  loadRecords();
  loadVehicles();
});

async function loadVehicles() {
  try {
    const res = await http.get("/api/vehicle/list", { params: { page: 1, size: 2000 } });
    vehicles.value = res.data || [];
  } catch {
    vehicles.value = [];
  }
}

async function loadRecords() {
  loading.value = true;
  try {
    const res = await fetchMaintenanceList({ page: pagination.currentPage, size: pagination.pageSize });
    const list = res.data || [];
    records.value = list;
    pagination.total = list.length;
  } catch (err: any) {
    ElMessage.error(err.message || "加载报修记录失败");
  } finally {
    loading.value = false;
  }
}

function handleSizeChange(size: number) {
  pagination.pageSize = size;
  loadRecords();
}

function handleCurrentChange(current: number) {
  pagination.currentPage = current;
  loadRecords();
}

function resolveVehicleLabel(vehicleId?: number) {
  const id = Number(vehicleId || 0);
  if (!id) return "-";
  const hit = vehicles.value.find(v => Number(v.vehicleId) === id);
  if (!hit) return String(id);
  const name = `${hit.brand || ""} ${hit.model || ""}`.trim();
  const number = hit.vehicleNumber ? `(${hit.vehicleNumber})` : "";
  return [name || "车辆", number].join(" ").trim();
}

function faultTypeText(type?: number) {
  return ({ 1: "电池故障", 2: "轮胎损坏", 3: "电机故障" } as Record<number, string>)[Number(type || 0)] || "其他";
}

function statusText(status?: number) {
  return ({ 1: "待维修", 2: "维修中", 3: "已完成" } as Record<number, string>)[Number(status || 0)] || "-";
}

function statusType(status?: number) {
  return ({ 1: "warning", 2: "danger", 3: "success" } as Record<number, string>)[Number(status || 0)] || "info";
}

function openEdit(row: MaintenanceRecord) {
  form.maintenanceId = Number(row.maintenanceId || 0);
  form.vehicleId = Number(row.vehicleId || 0);
  form.vehicleLabel = resolveVehicleLabel(form.vehicleId);
  form.faultTypeText = faultTypeText(row.faultType);
  form.maintenanceStatus = Number(row.maintenanceStatus || 1);
  form.maintenanceNote = row.maintenanceNote || "";
  dialogVisible.value = true;
}

async function save() {
  if (!form.maintenanceId) return;
  saving.value = true;
  try {
    await updateMaintenance(form.maintenanceId, {
      maintenanceId: form.maintenanceId,
      vehicleId: form.vehicleId,
      maintenanceStatus: form.maintenanceStatus,
      maintenanceNote: form.maintenanceNote
    });
    ElMessage.success("已保存");
    dialogVisible.value = false;
    loadRecords();
  } catch (err: any) {
    ElMessage.error(err.message || "保存失败");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
