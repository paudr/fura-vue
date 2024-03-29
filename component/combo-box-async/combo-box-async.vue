<script>
import FuraBaseComboBox from '../base-combo-box'
import { startsWith, equalInsensitive } from '../../utils/text'
import debounce from '../../utils/debounce'

export default {
  name: 'FuraComboBoxAsync',
  components: { FuraBaseComboBox },
  props: {
    /** Etiqueta que se muestra encima del campo de formulario asociado. */
    label: { type: String, default: '' },
    /** La descripción se muestra debajo del campo del formulario asociado para proporcionar detalles adicionales sobre qué valor ingresar. */
    description: { type: String, default: '' },
    /** Dibuja el borde del campo con color de error. */
    invalid: { type: Boolean, default: false },
    /** Mensaje de error estático que se muestra debajo del campo del formulario asociado. */
    errorMessage: { type: String, default: '' },
    /** Estado deshabilitado del campo de formulario asociado. */
    disabled: { type: Boolean, default: false },
    /** Estado requerido del campo de formulario asociado. */
    required: { type: Boolean, default: false },
    /** Indica si el campo de formulario asociado no tiene bordes. */
    borderless: { type: Boolean, default: false },
    /** Indica si el campo de formulario asociado está subrayado o no. */
    underlined: { type: Boolean, default: false },
    /** Método asincrónico para solicitar las opciones candidatas a elegir. */
    getOptions: { type: Function, required: true },
    /** Milisegundos sin cambiar el valor para realizar una solicitud de opciones candidatas. */
    getOptionsWait: { type: Number, default: 0 },
    /** Indica si las opciones seleccionadas deben ocultarse de las opciones candidatas. */
    filterOptions: { type: Boolean, default: false },
    /** Opcion o lista de opciones seleccionadas. */
    modelValue: { type: undefined, default: undefined },
    /** Indica si el campo es de solo lectura. */
    readonly: { type: Boolean, default: false },
    /** Indica si el campo permite seleccionar más de una opción. */
    multiple: { type: Boolean, default: false },
    /** Indica si el ComboBox se autocompleta. A medida que el usuario ingresa texto, se le sugerirán posibles coincidencias de la lista de opciones. */
    autoComplete: { type: Boolean, default: false },
    /** Indica si el campo ignora los acentos al autocompletar el valor. */
    accentInsensitive: { type: Boolean, default: false },
    /** Texto de ejemplo a mostrar en el campo. */
    placeholder: { type: String, default: null },
    /** Indica si el desplazamiento del Select debe hacerse sin animación. */
    immediateScroll: { type: Boolean, default: false },
    /** La cantidad máxima de opciones que se pueden seleccionar. */
    maxSelectedOptions: { type: Number, default: -1 }
  },
  emits: [
    /**
     * Se genera cuando el usuario realiza una alteración en el valor de ComboBox.
     * @property {Array} modelValue Lista de opciones seleccionadas
     */
    'update:modelValue',
    /** Se genera cuando el componente recibe el foco. */
    'focus',
    /** Se genera cuando el componente pierde el foco. */
    'blur'
  ],
  data () {
    return {
      open: false,
      suggestedIndex: -1,
      options: [],
      optionsLoaded: true
    }
  },
  computed: {
    /** Texto descriptivo de los valores seleccionados. */
    selectedText () {
      const { multiple, modelValue } = this
      if (multiple) {
        return Array.isArray(modelValue)
          ? modelValue.map(option => option.text).join(', ')
          : ''
      } else {
        return modelValue?.text ?? ''
      }
    },
    selectedValue () {
      const { modelValue, multiple } = this
      if (multiple) {
        return Array.isArray(modelValue)
          ? modelValue.map(option => option.value) ?? []
          : []
      } else {
        return modelValue?.value
      }
    },
    optionsWithSelected () {
      const { modelValue, multiple, options, filterOptions } = this
      const selectedValues = multiple
        ? Array.isArray(modelValue) ? modelValue : []
        : modelValue ? [modelValue] : []
      if (filterOptions) {
        const filterdOptions = options.filter(option => !this.isOptionSelected(option))
        return [...selectedValues, { type: 'divider' }, ...filterdOptions]
      } else {
        return options.length > 0
          ? options
          : selectedValues
      }
    },
    hasSelectedValues () {
      const { modelValue, multiple } = this
      if (multiple) {
        return Array.isArray(modelValue)
          ? modelValue.length > 0
          : false
      } else {
        return this.modelValue != null
      }
    },
    firstUnselectedOptionIndex () {
      const { modelValue, multiple } = this
      if (multiple) {
        return Array.isArray(modelValue)
          ? modelValue.length
          : 0
      } else {
        return this.modelValue != null
          ? 1
          : 0
      }
    },
    debouncedHandleInput () {
      const { handleInput, getOptionsWait } = this
      return debounce(handleInput, getOptionsWait, this)
    }
  },
  methods: {
    isOptionSelected (option) {
      if (this.multiple) {
        if (Array.isArray(this.modelValue)) {
          for (const selected of this.modelValue) {
            if (selected.value === option.value) {
              return true
            }
          }
        }
      } else {
        if (this.modelValue?.value === option.value) {
          return true
        }
      }
      return false
    },
    handleKeydown (event) {
      const { code } = event
      if (code !== 'Tab') {
        const { select, autofill } = this.$refs.comboBox.$refs
        if (code === 'ArrowDown' || code === 'ArrowUp') {
          event.preventDefault()
          if (select) {
            const indexIncrement = code === 'ArrowDown' ? 1 : -1
            this.suggestedIndex = select.getNextEnabledOptionIndex(this.suggestedIndex, indexIncrement)
          }
        } else if (code === 'Enter') {
          if (this.autoComplete) {
            this.handleSelect(this.suggestedIndex)
          } else {
            const selectedIndex = this.optionsWithSelected.findIndex(option =>
              (!option.type || option.type === 'option') &&
            !option.disabled &&
            equalInsensitive(option.text, autofill.$refs.field.value, this.accentInsensitive)
            )
            if (selectedIndex > -1) {
              this.handleSelect(selectedIndex)
            }
          }
        }
      }
    },
    handleClick () {
      this.open = !this.open
      if (
        this.options.length === 0 &&
        !this.hasSelectedValues
      ) {
        this.open = false
      }
      if (this.open) {
        this.$refs.comboBox.$refs.autofill.focus()
      }
    },
    handleSelect (index) {
      const selected = this.optionsWithSelected[index]
      if (this.multiple) {
        if (this.isOptionSelected(selected)) {
          const newValue = this.modelValue.filter(option => option.value !== selected.value)
          this.$emit('update:modelValue', newValue)
        } else {
          if (this.maxSelectedOptions < 0 || this.modelValue.length < this.maxSelectedOptions) {
            this.$emit('update:modelValue', [...this.modelValue, selected])
          }
        }
      } else {
        if (this.modelValue?.value === selected.value) {
          this.$emit('update:modelValue', null)
        } else {
          this.$emit('update:modelValue', selected)
        }
      }
      this.open = false
      this.suggestedIndex = -1
      this.$refs.comboBox.$refs.autofill.$refs.field.value = ''
      this.options = []
      this.$refs.comboBox.$refs.autofill.focus()
    },
    async handleInput (text) {
      this.options = []
      if (text) {
        this.optionsLoaded = false
        this.open = true
        this.options = await this.getOptions(text)
        if (this.autoComplete) {
          const firstIndex = this.filterOptions
            ? this.firstUnselectedOptionIndex
            : 0
          this.suggestedIndex = this.options.findIndex((option, index) =>
            index >= firstIndex &&
            (!option.type || option.type === 'option') &&
            !option.disabled &&
            startsWith(option.text, text, this.accentInsensitive)
          )
        }
      } else {
        this.open = false
      }
      this.optionsLoaded = true
    }
  }
}
</script>

<template>
  <FuraBaseComboBox
    ref="comboBox"
    allow-freeform
    hide-checkbox
    :label="label"
    :description="description"
    :invalid="invalid"
    :error-message="errorMessage"
    :disabled="disabled"
    :required="required"
    :borderless="borderless"
    :underlined="underlined"
    :options="optionsWithSelected"
    :value="selectedValue"
    :readonly="readonly"
    :multiple="multiple"
    :auto-complete="autoComplete"
    :accent-insensitive="accentInsensitive"
    :placeholder="placeholder"
    :selected-text="selectedText"
    :open="open && !disabled && !readonly"
    :suggested-index="suggestedIndex"
    :options-loaded="optionsLoaded"
    :immediate-scroll="immediateScroll"
    @keydown="handleKeydown"
    @click="handleClick"
    @select="handleSelect"
    @input="debouncedHandleInput"
    @click-outside.stop.prevent="open = false"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
  >
    <template #default="slotProps">
      <!--
        @slot Opción de ComboBox.
        @binding {object} option Referencia a la opción.
        @binding {number} index Índice de la opción.
        @binding {boolean} selected Estado de selecionado de la opción.
        @binding {boolean} marked Estado marcado de la opción.
        @binding {boolean} highlighted Estado resaltado de la opción.
        @binding {function} click Función para seleccionar la opción.
      -->
      <slot
        :option="slotProps.option"
        :index="slotProps.index"
        :selected="slotProps.selected"
        :marked="slotProps.marked"
        :highlighted="slotProps.highlighted"
        :click="slotProps.click"
      />
    </template>

    <template #header="slotProps">
      <!--
        @slot Encabezado de ComboBox
        @binding {object} option Referencia a la opción.
        @binding {number} index Índice de la opción.
      -->
      <slot
        name="header"
        :option="slotProps.option"
        :index="slotProps.index"
        :selected="slotProps.selected"
        :click="slotProps.click"
      />
    </template>

    <template #divider="slotProps">
      <!--
        @slot Separador del ComboBox
        @binding {object} option Referencia a la opción.
        @binding {number} index Índice de la opción.
      -->
      <slot
        name="divider"
        :option="slotProps.option"
        :index="slotProps.index"
        :selected="slotProps.selected"
        :click="slotProps.click"
      />
    </template>
  </FuraBaseComboBox>
</template>
