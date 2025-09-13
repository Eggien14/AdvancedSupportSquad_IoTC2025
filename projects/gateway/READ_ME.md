# Home Assistant Pi4 Gateway Setup Guide  
**Smart Shopping Cart System – IoT Challenge 2025 "Edge AI for Smart Retail"**  
*Team: Advanced Support Squad*

Welcome! This guide will walk you through installing Home Assistant on a Raspberry Pi 4 and deploying the custom gateway/frontend for the Smart Shopping Cart System, designed for the IoT Challenge 2025 "Edge AI for Smart Retail" by the Advanced Support Squad team. Please follow each step carefully to ensure a smooth setup.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [1. Flashing Home Assistant OS](#1-flashing-home-assistant-os)
- [2. First Boot & Initial Setup](#2-first-boot--initial-setup)
- [3. Accessing Home Assistant](#3-accessing-home-assistant)
- [4. Deploying the Custom Gateway Configuration](#4-deploying-the-custom-gateway-configuration)
  - [4.1. Folder Structure Overview](#41-folder-structure-overview)
  - [4.2. Copying the Config Folder](#42-copying-the-config-folder)
  - [4.3. Adding Custom Resources to Dashboard](#43-adding-custom-resources-to-dashboard)
  - [4.4. Using Dashboard_manage Files](#44-using-dashboard_manage-files)
- [5. Restarting Home Assistant](#5-restarting-home-assistant)
- [6. Troubleshooting](#6-troubleshooting)
- [7. Additional Notes](#7-additional-notes)

---

## Project Overview

This repository contains the **gateway and frontend** for the Smart Shopping Cart System, developed for the IoT Challenge 2025 "Edge AI for Smart Retail".  
- **Platform:** Home Assistant running on Raspberry Pi 4  
- **Purpose:** Edge AI gateway for smart retail carts, enabling real-time cart management, BLE beacon integration, and advanced dashboard features.  
- **Team:** Advanced Support Squad

---

## Prerequisites

- Raspberry Pi 4 (2GB RAM or higher recommended)
- microSD card (16GB or larger, Class 10/UHS recommended)
- Computer with SD card reader
- Network connection (Ethernet or Wi-Fi)
- [Balena Etcher](https://www.balena.io/etcher/) or similar flashing tool

---

## 1. Flashing Home Assistant OS

1. Download the latest [Home Assistant OS image for Raspberry Pi 4](https://www.home-assistant.io/installation/raspberrypi#install-home-assistant-os).
2. Use Balena Etcher to flash the image onto your microSD card.
3. Insert the microSD card into your Pi4 and power it on.

---

## 2. First Boot & Initial Setup

- Wait 10–20 minutes for the first boot (the Pi will download and install Home Assistant).
- Access Home Assistant at:  
  `http://homeassistant.local:8123`  
  or  
  `http://<your-pi-ip>:8123`
- Follow the on-screen instructions to create your Home Assistant account.

---

## 3. Accessing Home Assistant

- Once setup is complete, log in to the Home Assistant web UI.
- Familiarize yourself with the sidebar, settings, and dashboard.

---

## 4. Deploying the Custom Gateway Configuration

### 4.1. Folder Structure Overview

- **Config/**  
  Main configuration folder. This is the most important folder.  
  Contains all custom integrations, Lovelace UI resources, automations, and frontend files for the Smart Shopping Cart System.

- **Dashboard_manage/**  
  Contains raw YAML configuration files for dashboards.  
  Use these files for advanced dashboard customization via "Raw configuration editor".

- **.Server_endpoints/**  
  (You can ignore this folder; it is not required for Home Assistant setup.)

### 4.2. Copying the Config Folder

1. **Backup your current Home Assistant configuration** (if any).
2. Stop Home Assistant from the UI or via SSH:  
   `Settings` → `System` → `Hardware` → `Shutdown/Reboot` → `Stop Core`
3. Using Samba, SSH, or the File Editor add-on, copy the entire contents of the provided `Config/` folder into your Home Assistant configuration directory (usually `/config` or `/homeassistant`).
   - Overwrite existing files if prompted.
   - Ensure all subfolders (e.g., `www`, `custom_components`, etc.) are copied.

### 4.3. Adding Custom Resources to Dashboard

1. In Home Assistant UI, go to:  
   `Settings` → `Dashboards` → `Resources`
2. Click **Add Resource**.
3. For each custom JS file in `Config/www/` (e.g., `admin-cart-config-card.js`, `general-search-card.js`, etc.), add a resource:
   - URL: `/local/<filename>.js`
   - Resource type: `JavaScript Module`
4. Save and reload the dashboard.

### 4.4. Using Dashboard_manage Files

- The `Dashboard_manage/` folder contains YAML files for Lovelace dashboards.
- To use:
  1. Go to your dashboard.
  2. Click the three dots (⋮) → `Edit Dashboard` → `Raw configuration editor`.
  3. Copy and paste the content from the desired YAML file in `Dashboard_manage/`.
  4. Save changes.

---

## 5. Restarting Home Assistant

- After copying files and adding resources, **restart Home Assistant**:
  - `Settings` → `System` → `Restart`
- Wait for the system to come back online.

---

## 6. Troubleshooting

- **Custom cards not loading?**
  - Double-check that resources are added correctly in `Settings` → `Dashboards` → `Resources`.
  - Clear browser cache or use a private/incognito window.
- **Configuration errors?**
  - Check `Settings` → `System` → `Logs` for error messages.
  - Validate YAML syntax using the built-in YAML checker.
- **File permissions issues?**
  - Ensure all files in `/config` are owned by the correct user (usually `homeassistant`).

---

## 7. Additional Notes

- For advanced customization, refer to the comments in each JS/YAML file.
- The `.Server_endpoints/` folder is for backend services and is **not required** for Home Assistant operation.
- For updates, repeat the copy and resource steps as needed.
- For support, consult the [Home Assistant documentation](https://www.home-assistant.io/docs/).

---

**Enjoy your Smart Shopping Cart System Gateway on Raspberry Pi 4!**  
_Siliconlab-inspired, robust, and ready for the future of smart retail._

```# Home Assistant Pi4 Gateway Setup Guide  
**Smart Shopping Cart System – IoT Challenge 2025 "Edge AI for Smart Retail"**  
*Team: Advanced Support Squad*

Welcome! This guide will walk you through installing Home Assistant on a Raspberry Pi 4 and deploying the custom gateway/frontend for the Smart Shopping Cart System, designed for the IoT Challenge 2025 "Edge AI for Smart Retail" by the Advanced Support Squad team. Please follow each step carefully to ensure a smooth setup.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [1. Flashing Home Assistant OS](#1-flashing-home-assistant-os)
- [2. First Boot & Initial Setup](#2-first-boot--initial-setup)
- [3. Accessing Home Assistant](#3-accessing-home-assistant)
- [4. Deploying the Custom Gateway Configuration](#4-deploying-the-custom-gateway-configuration)
  - [4.1. Folder Structure Overview](#41-folder-structure-overview)
  - [4.2. Copying the Config Folder](#42-copying-the-config-folder)
  - [4.3. Adding Custom Resources to Dashboard](#43-adding-custom-resources-to-dashboard)
  - [4.4. Using Dashboard_manage Files](#44-using-dashboard_manage-files)
- [5. Restarting Home Assistant](#5-restarting-home-assistant)
- [6. Troubleshooting](#6-troubleshooting)
- [7. Additional Notes](#7-additional-notes)

---

## Project Overview

This repository contains the **gateway and frontend** for the Smart Shopping Cart System, developed for the IoT Challenge 2025 "Edge AI for Smart Retail".  
- **Platform:** Home Assistant running on Raspberry Pi 4  
- **Purpose:** Edge AI gateway for smart retail carts, enabling real-time cart management, BLE beacon integration, and advanced dashboard features.  
- **Team:** Advanced Support Squad

---

## Prerequisites

- Raspberry Pi 4 (2GB RAM or higher recommended)
- microSD card (16GB or larger, Class 10/UHS recommended)
- Computer with SD card reader
- Network connection (Ethernet or Wi-Fi)
- [Balena Etcher](https://www.balena.io/etcher/) or similar flashing tool

---

## 1. Flashing Home Assistant OS

1. Download the latest [Home Assistant OS image for Raspberry Pi 4](https://www.home-assistant.io/installation/raspberrypi#install-home-assistant-os).
2. Use Balena Etcher to flash the image onto your microSD card.
3. Insert the microSD card into your Pi4 and power it on.

---

## 2. First Boot & Initial Setup

- Wait 10–20 minutes for the first boot (the Pi will download and install Home Assistant).
- Access Home Assistant at:  
  `http://homeassistant.local:8123`  
  or  
  `http://<your-pi-ip>:8123`
- Follow the on-screen instructions to create your Home Assistant account.

---

## 3. Accessing Home Assistant

- Once setup is complete, log in to the Home Assistant web UI.
- Familiarize yourself with the sidebar, settings, and dashboard.

---

## 4. Deploying the Custom Gateway Configuration

### 4.1. Folder Structure Overview

- **Config/**  
  Main configuration folder. This is the most important folder.  
  Contains all custom integrations, Lovelace UI resources, automations, and frontend files for the Smart Shopping Cart System.

- **Dashboard_manage/**  
  Contains raw YAML configuration files for dashboards.  
  Use these files for advanced dashboard customization via "Raw configuration editor".

- **.Server_endpoints/**  
  (You can ignore this folder; it is not required for Home Assistant setup.)

### 4.2. Copying the Config Folder

1. **Backup your current Home Assistant configuration** (if any).
2. Stop Home Assistant from the UI or via SSH:  
   `Settings` → `System` → `Hardware` → `Shutdown/Reboot` → `Stop Core`
3. Using Samba, SSH, or the File Editor add-on, copy the entire contents of the provided `Config/` folder into your Home Assistant configuration directory (usually `/config` or `/homeassistant`).
   - Overwrite existing files if prompted.
   - Ensure all subfolders (e.g., `www`, `custom_components`, etc.) are copied.

### 4.3. Adding Custom Resources to Dashboard

1. In Home Assistant UI, go to:  
   `Settings` → `Dashboards` → `Resources`
2. Click **Add Resource**.
3. For each custom JS file in `Config/www/` (e.g., `admin-cart-config-card.js`, `general-search-card.js`, etc.), add a resource:
   - URL: `/local/<filename>.js`
   - Resource type: `JavaScript Module`
4. Save and reload the dashboard.

### 4.4. Using Dashboard_manage Files

- The `Dashboard_manage/` folder contains YAML files for Lovelace dashboards.
- To use:
  1. Go to your dashboard.
  2. Click the three dots (⋮) → `Edit Dashboard` → `Raw configuration editor`.
  3. Copy and paste the content from the desired YAML file in `Dashboard_manage/`.
  4. Save changes.

---

## 5. Restarting Home Assistant

- After copying files and adding resources, **restart Home Assistant**:
  - `Settings` → `System` → `Restart`
- Wait for the system to come back online.

---

## 6. Troubleshooting

- **Custom cards not loading?**
  - Double-check that resources are added correctly in `Settings` → `Dashboards` → `Resources`.
  - Clear browser cache or use a private/incognito window.
- **Configuration errors?**
  - Check `Settings` → `System` → `Logs` for error messages.
  - Validate YAML syntax using the built-in YAML checker.
- **File permissions issues?**
  - Ensure all files in `/config` are owned by the correct user (usually `homeassistant`).

---

## 7. Additional Notes

- For advanced customization, refer to the comments in each JS/YAML file.
- The `.Server_endpoints/` folder is for backend services and is **not required** for Home Assistant operation.
- For updates, repeat the copy and resource steps as needed.
- For support, consult the [Home Assistant documentation](https://www.home-assistant.io/docs/).

---

**Enjoy your Smart Shopping Cart System Gateway on Raspberry Pi 4!**  
_Siliconlab-inspired, robust, and ready for the future of smart retail._
