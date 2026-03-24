# DESIGN-IMAGING-UPGRADE.md
> 影像升級策略（2026-03-24 決定）

## 策略總覽

**原則**：真實醫學影像 > AI 生成，教學正確性第一

**授權**：教學 + 非商業用途 → CC-BY-NC-SA OK，加 attribution 即可

---

## CXR 升級

### 來源
- **NIH Chest X-ray14**（CC0 公共領域）: 112K 張，HuggingFace 可篩 pathology 下載
- **LITFL**（CC-BY-NC-SA 4.0）: 補充特定 case
- **Radiopaedia**（CC-BY-NC-SA 3.0）: 有 bot 防護 + DICOM viewer，備案

### 需要的 CXR Types（對應 CxrCanvas.tsx 的 CXRType）
| Type | Description | 來源策略 |
|------|-------------|----------|
| normal | 正常 CXR | NIH (No Finding label) |
| hemothorax | 血胸 | NIH (Effusion) + 後期 Wilson 挑 |
| tension_ptx | 張力性氣胸 | NIH (Pneumothorax) |
| pericardial_effusion | 心包積液/水瓶心 | NIH (Cardiomegaly) |
| pulmonary_edema | 肺水腫 | NIH (Edema) |
| pleural_effusion | 肋膜積液 | NIH (Effusion) |

每種 2-3 張不同 severity。存到 `public/assets/cxr/`。

---

## Echo（心臟超音波）升級

### 來源：LITFL Ultrasound Cases（CC-BY-NC-SA 4.0，MP4 格式）

### 已找到的 LITFL Echo Resources

#### Cardiac Echo
| Case | Pathology | Videos | URL |
|------|-----------|--------|-----|
| Case 005 | **Cardiac Tamponade** — pericardial effusion, RA/RV collapse, distended IVC | 6 MP4 (subcostal, A4C, IVC, PLAX, PSAX, posterior) | litfl.com/ultrasound-case-005/ |
| Case 006 | **Large Pericardial Effusion** — echogenic, R-side chamber collapse | 1 MP4 (A4C) | litfl.com/ultrasound-case-006/ |
| Case 015 | **Hypovolemia** — flat IVC, complete inspiratory collapse | 2 MP4 (IVC long, IVC trans) | litfl.com/ultrasound-case-015/ |
| Case 016 | **Aortic Dissection** — dilated proximal aorta (6cm), dissection flap | 4 MP4 | litfl.com/ultrasound-case-016/ |
| Case 079 | **PE / RV Dilation** — D-shaped septum, McConnell's sign, reduced TAPSE | 2 MP4 (PSAX, A4C) | litfl.com/ultrasound-case-079/ |
| Case 091 | **Takotsubo** — apical ballooning, regional wall motion abnormality | 4 MP4 (PLAX, PSAX x2, A4C) | litfl.com/ultrasound-case-091/ |

#### Lung Ultrasound
| Page | Pathology | Videos | URL |
|------|-----------|--------|-----|
| Pulmonary Oedema | **B-lines** — bilateral, confluent | 2 MP4 + 1 JPG | litfl.com/lung-ultrasound-pulmonary-oedema/ |
| Pneumothorax | **Absent lung sliding** — A-lines without sliding | 1 MP4 | litfl.com/lung-ultrasound-pneumothorax/ |
| Pleural Effusion | **Effusion** — varied sizes | 1 JPG (no video) | litfl.com/lung-ultrasound-pleural-effusion/ |

### Video URL 清單（MP4 直連）

```
# Cardiac Tamponade (Case 005)
https://litfl.com/wp-content/uploads/2018/11/LITFL-Top-100-Ultrasound-005-01.mp4  # subcostal
https://litfl.com/wp-content/uploads/2018/11/LITFL-Top-100-Ultrasound-005-02.mp4  # A4C
https://litfl.com/wp-content/uploads/2018/11/LITFL-Top-100-Ultrasound-005-03.mp4  # IVC
https://litfl.com/wp-content/uploads/2018/11/LITFL-Top-100-Ultrasound-005-04.mp4  # PLAX
https://litfl.com/wp-content/uploads/2018/11/LITFL-Top-100-Ultrasound-005-05.mp4  # PSAX
https://litfl.com/wp-content/uploads/2018/11/LITFL-Top-100-Ultrasound-005-06.mp4  # posterior

# Pericardial Effusion (Case 006)
https://litfl.com/wp-content/uploads/2018/11/LITFL-Top-100-Ultrasound-006-01.mp4  # A4C

# Hypovolemia IVC (Case 015)
https://litfl.com/wp-content/uploads/2018/12/LITFL-Top-100-Ultrasound-015-01-flat-IVC-long.mp4
https://litfl.com/wp-content/uploads/2018/12/LITFL-Top-100-Ultrasound-015-02-flat-IVC-trans.mp4

# RV Dilation / PE (Case 079)
https://litfl.com/wp-content/uploads/2018/12/Ultrasound-Case-079-01-Parasternal-short-axis.mp4  # D-sign
https://litfl.com/wp-content/uploads/2018/12/Ultrasound-Case-079-02-Apical-4-chamber-view.mp4   # McConnell

# Takotsubo (Case 091)
https://litfl.com/wp-content/uploads/2018/12/Ultrasound-Top-100-091-01-PSLX-takotsubo.mp4
https://litfl.com/wp-content/uploads/2018/12/Ultrasound-Top-100-091-02-PSSX-takotsubo.mp4
https://litfl.com/wp-content/uploads/2018/12/Ultrasound-Top-100-091-03-PSSX-takotsubo.mp4
https://litfl.com/wp-content/uploads/2018/12/Ultrasound-Top-100-091-04-Ap4ch-takotsubo.mp4

# Lung B-lines (Pulmonary Oedema)
https://litfl.com/wp-content/uploads/2018/12/Pulmonary-oedema-B-lines.mp4
https://litfl.com/wp-content/uploads/2018/12/Pulmonary-oedema-confluent-B-lines.mp4

# Lung Pneumothorax
https://litfl.com/wp-content/uploads/2018/11/Lung-ultrasound-pneumothorax-001.mp4
```

### 仍需找的 Echo States
- [ ] **Normal cardiac function** — 正常 A4C with good EF
- [ ] **Low EF / DCM** — dilated LV with poor systolic function
- [ ] **Normal IVC** — partial inspiratory collapse
- [ ] **Distended IVC** — for tamponade/fluid overload
- [ ] **Lung A-lines** — normal aerated lung

### 整合方案
1. IVC real-time → **保留 Canvas rendering**（CVP/RR 連動太好用）
2. Cardiac A4C → **MP4 loop 嵌入**，根據 scenario state 選播哪個
3. Lung US → **MP4 + 靜態 JPG 混合**

---

## Attribution 模板

所有外部影像必須加 attribution footer：
```
Source: LITFL (Life in the Fast Lane) | Author: Dr James Rippey
License: CC-BY-NC-SA 4.0 | URL: https://litfl.com/ultrasound-case-XXX/
```

---

## 實作步驟

### Phase 1: Echo (Priority — Wilson 說先做 cardiac US)
1. 下載 LITFL MP4 到 `public/assets/echo/`
2. 建 echo-selector.ts mapping scenario state → video file
3. PocusCanvas 改為：A4C/PLAX/PSAX → 播 MP4，IVC → 保留 Canvas
4. 加 attribution overlay

### Phase 2: CXR
1. NIH dataset 篩圖 → `public/assets/cxr/`
2. CxrCanvas 改為：有真圖用真圖、fallback 到 Canvas schematic
3. 加 attribution overlay

### Phase 3: Lung US
1. B-lines / PTX MP4 整合
2. A-lines 如果沒找到好的 MP4，保留 Canvas rendering
