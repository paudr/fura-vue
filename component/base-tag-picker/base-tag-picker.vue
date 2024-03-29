<script>
import FuraBaseFieldCombo from '../base-field-combo'
import FuraAutofill from '../autofill'
import FuraBaseSelect from '../base-select'
import FuraSpinner from '../spinner'
import FuraIcon from '../icon'
import dropup from '../../mixin/dropup.js'

export default {
  name: 'FuraBaseTagPicker',
  mixins: [dropup],
  components: {
    FuraBaseFieldCombo,
    FuraAutofill,
    FuraBaseSelect,
    FuraSpinner,
    FuraIcon
  },
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
    /** Indica si se muestra el panel del campo de formulario asociado. */
    open: { type: Boolean, default: false },
    /** Valor o lista de valores seleccionados. */
    selectedItems: { type: Array, default: () => [] },
    /** Los elementos de TagPicker. */
    items: { type: Array, default: () => [] },
    /** Índice del elemento sugerida. */
    suggestedIndex: { type: Number, default: -1 },
    /** Texto de ejemplo a mostrar en el campo. */
    placeholder: { type: String, default: null },
    /** Indica si el campo es de solo lectura. */
    readonly: { type: Boolean, default: false },
    /** Indica si el TagPicker se autocompleta. A medida que el usuario ingresa texto, se le sugerirán posibles coincidencias de la lista de opciones. */
    autoComplete: { type: Boolean, default: false },
    /** Indica si el campo ignora los acentos al autocompletar el valor. */
    accentInsensitive: { type: Boolean, default: false },
    /** Indica si el TagPicker debe mostrar las opciones en vez de un progreso de carga. */
    itemsLoaded: { type: Boolean, default: false },
    /** El texto a mostrar en el progreso de carga. */
    loadingText: { type: String, default: '' },
    /** Indica si el desplazamiento del Select debe hacerse sin animación. */
    immediateScroll: { type: Boolean, default: false }
  },
  computed: {
    suggestedText () {
      const suggestedItem = this.items[this.suggestedIndex]
      return suggestedItem?.text ?? ''
    },
    selectedValues () {
      return this.selectedItems.map(item => item.value)
    }
  },
  emits: [
    /**
     * Se genera cuando el usuario selecciona un elemento.
     * @property {number} index Indice del elemento seleccionada.
     */
    'select',
    /**
     * Se genera cuando el usuario elimina un elemento.
     * @property {number} index Indice del elemento eliminado.
     */
    'remove',
    /**
     * Se genera cuando el usuario realiza un cambio en el campo de texto de ComboBox.
     * @property {string} text Texto introducido en el campo de texto de ComboBox.
     */
    'input',
    /**
     * Se genera cuando el usuario pulsa una tecla.
     * @property {KeyboardEvent} keyboardEvent Descripción del evento de pulsación de tecla.
     */
    'keydown',
    /**
     * Se genera cuando el componente tiene el panel desplegado y el usuario hace clic fuera del componente.
     * @property {MouseEvent} mouseEvent Descripción del evento de pulsación de ratón.
     */
    'clickOutside',
    /** Se genera cuando el componente recibe el foco. */
    'focus',
    /** Se genera cuando el componente pierde el foco. */
    'blur'
  ]
}
</script>

<template>
  <FuraBaseFieldCombo
    ref="base"
    class="fura-tagPicker"
    :class="{ 'fura-disabled': disabled }"
    :label="label"
    :description="description"
    :invalid="invalid"
    :error-message="errorMessage"
    :disabled="disabled"
    :required="required"
    :borderless="borderless"
    :underlined="underlined"
    :open="open && !disabled && !readonly"
    :dropup="dropup"
    @click="$refs.autofill.focus()"
    @click-outside="$emit('clickOutside', $event)"
    @focus="$emit('focus')"
    @blur="$emit('blur')"
  >
    <div class="fura-field">
      <span
        v-if="selectedItems.length > 0"
        class="fura-itemsWrapper"
      >
        <template v-for="(item, index) in selectedItems">
          <!--
            @slot TagPicker's selected item.
            @binding {object} item Item reference.
            @binding {number} index Item's index.
            @binding {function} click Function to unselect the item.
          -->
          <slot
            name="tag"
            :item="item"
            :index="index"
            :click="() => $emit('remove', index)"
          >
            <div
              :key="index"
              class="fura-tag"
              :class="{ 'fura-disabled': disabled }"
              tabindex="0"
            >
              <span v-text="item.text" />
              <button
                type="button"
                tabindex="-1"
                @click.stop="$emit('remove', index)"
              >
                <span>
                  <FuraIcon
                    class="fura-itemIcon"
                    name="Cancel"
                  />
                </span>
              </button>
            </div>
          </slot>
        </template>
      </span>
      <FuraAutofill
        ref="autofill"
        class="fura-autofill"
        :autofill="autoComplete"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :accent-insensitive="accentInsensitive"
        :suggested-value="autoComplete ? suggestedText : ''"
        @update:model-value="$emit('input', $event)"
        @keydown="$emit('keydown', $event)"
      />
    </div>
    <template #dropdown>
      <div class="fura-dropdownWrapper">
        <FuraBaseSelect
          v-if="itemsLoaded"
          ref="select"
          class="fura-select"
          multiple
          hide-checkbox
          :options="items"
          :value="selectedValues"
          @select="$emit('select', $event)"
          @keydown="$emit('keydown', $event)"
        >
          <template #default="slotProps">
            <!--
              @slot Elemento del desplegable de TagPicker.
              @binding {object} option Referencia a la opción.
              @binding {number} index Índice de la opción.
              @binding {boolean} selected Estado de selecionado de la opción.
              @binding {boolean} marked Estado marcado de la opción.
              @binding {boolean} highlighted Estado resaltado de la opción.
              @binding {function} click Función para seleccionar la opción.
            -->
            <slot
              name="item"
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
              @slot Encabezado del desplegable de TagPicker
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
              @slot Separador del desplegable del TagPicker
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
        </FuraBaseSelect>
        <div
          v-else
          class="fura-loadingDropdown"
        >
          <FuraSpinner
            class="fura-spinner"
            :label="loadingText"
          />
        </div>
      </div>
    </template>
  </FuraBaseFieldCombo>
</template>

<style lang="less" scoped src="./base-tag-picker.less"></style>
