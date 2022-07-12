terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.0.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "kubernetes_group" {
  name     = "kubernetes-group"
  location = "Switzerland North"
}

resource "azurerm_container_registry" "garseb" {
  name                = "garseb"
  resource_group_name = azurerm_resource_group.kubernetes_group.name
  location            = azurerm_resource_group.kubernetes_group.location
  sku                 = "Basic"
}

resource "azurerm_kubernetes_cluster" "kubernetes_cluster" {
  depends_on = [
    azurerm_resource_group.kubernetes_group,
    azurerm_container_registry.registry-zh1
  ]

  name                = "kubernetes-zh1"
  location            = azurerm_resource_group.kubernetes_group.location
  resource_group_name = azurerm_resource_group.kubernetes_group.name
  dns_prefix          = "kubernetes-zh1"

  default_node_pool {
    name       = "knodepool"
    node_count = 1
    vm_size    = "Standard_D2_v2"
  }

  identity {
    type = "SystemAssigned"
  }    
}
