output "resource_group_name" {
  description = "ชื่อของ Resource Group ที่สร้างขึ้น"
  value       = azurerm_resource_group.rg.name
}

output "acr_login_server" {
  description = "URL สำหรับ login เข้า Container Registry"
  value       = azurerm_container_registry.acr.login_server
}

output "aks_cluster_name" {
  value = azurerm_kubernetes_cluster.aks.name
}