const app = new Vue({
  el: '#app',
  data: {
    ui: false,
    fps: 70,
    arrowLeft: true,
    arrowRight: true,
    randomColor: '#FFFFFF', 
    hovering: false,
    leftItems: [
      { id: 'boost', label: 'BOOST' },
      { id: 'reset', label: 'RESET' },
      { id: 'default', label: 'DEFAULT' }
    ],
    rightItems: [
      { id: 'normal', label: 'NORMAL' },
      { id: 'medium', label: 'MEDIUM' },
      { id: 'ultra', label: 'ULTRA' }
    ],
    isHovered: {},
    selectedId: localStorage.getItem('selectedId') || 'boost',
    settings: [
      {
        title: 'CARS RENDER DISTANCE',
        type: 'slider',
        value: 50,
        range: { min: 0, max: 100 },
        native: 'SetVehicleDensityMultiplierThisFrame'
      },
      {
        title: 'REFLECTIONS & LIGHTS',
        type: 'switch',
        value: localStorage.getItem('reflections-lights') ? JSON.parse(localStorage.getItem('reflections-lights')) : true,
        native: 'ToggleReflection'
      },
      {
        title: 'SHADOWS QUALITY',
        type: 'slider',
        value: 1,
        range: { min: 0, max: 3 },
        native: 'SetShadowQuality'
      },
      {
        title: 'GRASS DETAIL',
        type: 'slider',
        value: 50,
        range: { min: 0, max: 100 },
        native: 'SetGrassDensity'
      },
      {
        title: 'PED DENSITY',
        type: 'slider',
        value: 50,
        range: { min: 0, max: 100 },
        native: 'SetPedDensityMultiplierThisFrame'
      },
      {
        title: 'SCENARIO PED DENSITY',
        type: 'slider',
        value: 50,
        range: { min: 0, max: 100 },
        native: 'SetScenarioPedDensityMultiplierThisFrame'
      },
    ]
  },
  created() {
    window.addEventListener('message', this.handleEventMessage);
    document.addEventListener("keydown", this.onKeydown);
    this.loadSettingsFromLocalStorage();
  },
  watch: {
    selectedId() {
      this.randomColor = this.generateRandomColor(); 
    },
    settings: {
      handler(newValue, oldValue) {
        newValue.forEach((setting, index) => {
          if (setting.type === 'slider' || setting.type === 'switch') {
            if (setting.value !== oldValue[index].value) {
              this.applySetting(index); 
            }
          }
        });
        this.saveSettingsToLocalStorage();
      },
      deep: true
    }
  },
  computed: {
    maxFps() {
      return 120; 
    }
  },
  mounted() {
    this.randomColor = this.generateRandomColor(); 
    this.applyAllSettings();
    this.settings.forEach((setting, index) => {
      if (setting.type === 'switch') {
        const storedValue = this.getSwitchStatusFromStorage(setting.title);
        if (storedValue !== null) {
          this.$set(this.settings[index], 'value', storedValue);
        }
      }
    });
  },
  methods: {
    generateRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    toggleSwitch(index) {
      const setting = this.settings[index];
      setting.value = !setting.value;  
      this.saveSwitchStatusToStorage(setting.title, setting.value); 
      this.applySetting(index);  
    },
    saveSwitchStatusToStorage(key, value) {
      localStorage.setItem(key, JSON.stringify(value)); 
    },
    getSwitchStatusFromStorage(key) {
      const storedValue = localStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : true;
    },
    getSliderMin(item) {
      return item.range ? item.range.min : 0;
    },
    getSliderMax(item) {
      return item.range ? item.range.max : 100;
    },
    getEmojiForSetting(title) {
      switch (title) {
        case 'CARS RENDER DISTANCE':
          return '🏎️';
        case 'SHADOWS QUALITY':
          return '🌕';
        case 'GRASS DETAIL':
          return '🍃';
        case 'PED DENSITY':
          return '🧍‍♂️';
        case 'SCENARIO PED DENSITY':
          return '👨‍👩‍👧‍👦';
        default:
          return '🛠️';
      }
    },
    applyBoostSettings() {
      this.applySettingsWithValues(30, false, 0);
      this.selectedId = 'boost';
      localStorage.setItem('selectedId', this.selectedId);
    },
    applyResetSettings() {
      try {
        localStorage.clear();
        this.settings.forEach(setting => {
          if (setting.native === 'SetVehicleDensityMultiplierThisFrame') setting.value = 50;
          if (setting.native === 'ToggleReflection') setting.value = true;
          if (setting.native === 'SetShadowQuality') setting.value = 1;
          if (setting.native === 'SetGrassDensity') setting.value = 50;
          if (setting.native === 'SetPedDensityMultiplierThisFrame') setting.value = 50;
          if (setting.native === 'SetScenarioPedDensityMultiplierThisFrame') setting.value = 50;
        });
        this.selectedId = 'reset';
        localStorage.setItem('selectedId', this.selectedId);
        this.applyAllSettings();
        console.log('Restore default settings.');
      } catch (error) {
        console.error("Reset error:", error);
      }
    },    
    applyDefaultSettings() {
      this.applySettingsWithValues(50, true, 1);
      this.selectedId = 'default';
      localStorage.setItem('selectedId', this.selectedId);
    },
    applyNormalSettings() {
      this.applySettingsWithValues(60, true, 2);
      this.selectedId = 'normal';
      localStorage.setItem('selectedId', this.selectedId);
    },
    applyMediumSettings() {
      this.applySettingsWithValues(80, true, 2);
      this.selectedId = 'medium';
      localStorage.setItem('selectedId', this.selectedId);
    },
    applyUltraSettings() {
      this.applySettingsWithValues(100, true, 3);
      this.selectedId = 'ultra';
      localStorage.setItem('selectedId', this.selectedId);
    },
    applySettingsWithValues(vehicleDensity, reflections, shadowQuality) {
      this.settings.forEach(setting => {
        if (setting.native === 'SetVehicleDensityMultiplierThisFrame') setting.value = vehicleDensity;
        if (setting.native === 'ToggleReflection') setting.value = reflections;
        if (setting.native === 'SetShadowQuality') setting.value = shadowQuality;
        if (setting.native === 'SetGrassDensity') setting.value = vehicleDensity;
        if (setting.native === 'SetPedDensityMultiplierThisFrame') setting.value = vehicleDensity;
        if (setting.native === 'SetScenarioPedDensityMultiplierThisFrame') setting.value = vehicleDensity;
      });
      this.applyAllSettings();
      this.updateFPS(); 
    },
    applyAllSettings() {
      this.settings.forEach((setting, index) => {
        this.applySetting(index); 
      });
    },
    updateFPS() {
      const resourceName = typeof GetParentResourceName === 'undefined' ? 'defaultResource' : GetParentResourceName();
      const update = () => {
        if (this.ui) {
          setTimeout(update, 10000); 
          $.post(`https://${resourceName}/getFPS`, {}, (response) => {
            if (response.fps) {
              this.fps = response.fps;
            }
          });
        }
      };
      update(); 
    },  
    handleEventMessage(event) {
      const item = event.data;
      if (item.data === 'MENU') {
        this.ui = item.open;
        this.updateFPS();
        this.settings.forEach((setting) => {
          if (setting.native === 'SetVehicleDensityMultiplierThisFrame') this.$set(setting, 'value', item.settings.vehicleDensity);
          if (setting.native === 'ToggleReflection') this.$set(setting, 'value', item.settings.reflectionsEnabled);
          if (setting.native === 'SetShadowQuality') this.$set(setting, 'value', item.settings.shadowQuality);
          if (setting.native === 'SetGrassDensity') this.$set(setting, 'value', item.settings.grassDensity);
          if (setting.native === 'SetPedDensityMultiplierThisFrame') this.$set(setting, 'value', item.settings.pedDensity);
          if (setting.native === 'SetScenarioPedDensityMultiplierThisFrame') this.$set(setting, 'value', item.settings.scenarioPedDensity);
        });
        this.settings.forEach((item, index) => {
          if (item.type === 'slider') this.updateGradient(index);
        });
      } else if (item.data === 'CLOSE') {
        this.Close();
      } else if (item.data === 'FPS_UPDATE') {
        this.fps = item.fps;
      }
    },
    Close() {
      $.post(`https://${GetParentResourceName()}/Close`, JSON.stringify({}));
      this.ui = false;
    },
    onKeydown(event) {
      if (event.key === "Escape") {
        this.Close();
      }
    },
    toggleLeftArrow() {
      this.arrowLeft = !this.arrowLeft;
    },
    toggleRightArrow() {
      this.arrowRight = !this.arrowRight;
    },
    getHexItemStyle(isVisible, id) {
      const isSelected = this.selectedId === id;
      const isHovering = this.isHovered[id];
      const backgroundImage = isSelected || isHovering
        ? "url('../assets/img/component/hexagon-2.png')"
        : "url('../assets/img/component/hexagon-1.png')";
      return {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(50px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        background: `${backgroundImage} no-repeat center`,
        backgroundSize: 'contain',
      };
    },
    onHover(id, hovering) {
      this.$set(this.isHovered, id, hovering);
    },
    applySetting(index) {
      const setting = this.settings[index];
      $.post(`https://${GetParentResourceName()}/applySetting`, JSON.stringify({
        native: setting.native,
        value: setting.value,
        title: setting.title
      }), (response) => {
        if (response && response.fps) {
          this.fps = Math.floor(response.fps);
        }
      });
      this.saveSettingsToLocalStorage(); 
    },
    updateGradient(index) {
      const sliderElement = this.$refs[`slider-${index}`][0];
      if (!sliderElement) return;
      const value = this.settings[index].value;
      const min = this.getSliderMin(this.settings[index]);
      const max = this.getSliderMax(this.settings[index]);
      const percentage = ((value - min) / (max - min)) * 100;
      const gradients = {
        'CARS RENDER DISTANCE': `rgba(0, 0, 0, 1) ${percentage}%, rgba(90, 90, 90, 0.8)`,
        'REFLECTIONS & LIGHTS': `rgba(255, 20, 147, 1) ${percentage}%, rgba(255, 105, 180, 0.8)`,
        'SHADOWS QUALITY': `rgba(30, 30, 30, 1) ${percentage}%, rgba(60, 60, 60, 0.8)`,
        'GRASS DETAIL': `rgba(0, 128, 0, 1) ${percentage}%, rgba(60, 179, 113, 0.8)`,
        'PED DENSITY': `rgba(255, 69, 0, 1) ${percentage}%, rgba(255, 160, 122, 0.8)`,
        'SCENARIO PED DENSITY': `rgba(255, 255, 255, 1) ${percentage}%, rgba(200, 200, 200, 0.8)`
      };
      sliderElement.style.background = `linear-gradient(90deg, ${gradients[this.settings[index].title]} 100%)`;
      sliderElement.style.transition = 'background 0.8s ease';
    },
    loadSettingsFromLocalStorage() {
      const savedSettings = JSON.parse(localStorage.getItem('fpsSettings'));
      if (savedSettings) {
        this.settings.forEach((setting, index) => {
          if (savedSettings[setting.native] !== undefined) {
            this.$set(this.settings[index], 'value', savedSettings[setting.native]);
          }
        });
      }
    },
    saveSettingsToLocalStorage() {
      const settingsToSave = this.settings.reduce((acc, setting) => {
        acc[setting.native] = setting.value;
        return acc;
      }, {});
      localStorage.setItem('fpsSettings', JSON.stringify(settingsToSave));
    },
  }
});
