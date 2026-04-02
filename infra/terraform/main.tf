terraform {
  required_providers {
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.17.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

resource "azurerm_resource_group" "rg" {
  name     = "my-rg"
  location = "East Asia"
}

# ACR
resource "azurerm_container_registry" "acr" {
  name                = "songlnwzacr"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# AKS
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "songlnwzak8s"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "songlnwzak8s"
  oidc_issuer_enabled = true

  default_node_pool {
    name       = "default"
    node_count = 3
    vm_size    = "Standard_B2s_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}

# ให้ AKS ใช้ ACR
resource "azurerm_role_assignment" "acr_pull" {
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.acr.id
}

# Grafana & Prometheus Monitoring via Helm
provider "helm" {
  kubernetes {
    host                   = azurerm_kubernetes_cluster.aks.kube_config.0.host
    client_certificate     = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_certificate)
    client_key             = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.client_key)
    cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.aks.kube_config.0.cluster_ca_certificate)
  }
}

resource "helm_release" "prometheus" {
  name             = "prometheus"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  namespace        = "monitoring"
  create_namespace = true
}
