<script>
import FuraBaseDetailsListRow from '../base-details-list-row'

export default {
  name: 'FuraBaseDetailsListBody',
  components: { FuraBaseDetailsListRow },
  props: {
    /** Definición de las columnas. */
    columns: { type: Array, required: true },
    /** Datos a mostrar en la tabla. */
    data: { type: Array, required: true },
    /** Índice del primer elemento a mostrar. */
    startIndex: { type: Number, required: true },
    /** Número de elementos a mostrar. */
    count: { type: Number, required: true },
    /**
     * Controla el tipo de selección de filas. Si no está definido, no hay control de selcción.
     * @values multiple, simple, safe
     */
    selection: {
      type: String,
      default: '',
      validator: selection => !selection || ['multiple', 'simple', 'safe'].includes(selection)
    },
    /** Lista con los índices seleccionados. */
    selectedIndices: { type: Array, default: () => [] },
    /** Indica si la tabla debe dibujarse en modo compacto. */
    compact: { type: Boolean, default: false },
    /** Indica si los grupos de la tabla se puede plegar. */
    collapsible: { type: Boolean, default: false },
    /** Indica si las filas de cabecera y pie estan seleccionadas. */
    headersSelected: { type: Boolean, default: false },
    /** Índice de la agrupación de datos. */
    groupIndex: { type: Number, default: null },
    /** Definición de la agrupación de datos. */
    group: { type: Object, default: null }
  },
  emits: [
    /**
     * Se genera cuando el usuario hace clic sobre una fila.
     * @property {number} index Índice de la fila pulsada.
     */
    'select',
    /**
     * Se genera cuando el usuario hace clic sobre una celda.
     * @property {object} coords Objeto ({ row, column }) con el número de fila y columna pulsada.
     */
    'clickCell',
    /**
     * Se genera cuando el usuario hace clic, con el botón derecho, sobre una fila.
     * @property {object} coords Objeto ({ row, column }) con el número de fila y columna pulsada.
     */
    'contextmenuRow',
    /**
     * Se genera cuando el usuario hace clic, con el botón derecho, sobre una celda.
     * @property {object} coords Objeto ({ row, column }) con el número de fila y columna pulsada.
     */
    'contextmenuCell'
  ],
  computed: {
    /** Datos a mostrar. */
    currentData () {
      return this.data.slice(this.startIndex, this.startIndex + this.count)
    },
    hasHeaderSlots () {
      return this.$slots.header && this.$slots.header().length > 0
    },
    hasFooterSlots () {
      return this.$slots.footer && this.$slots.footer().length > 0
    }
  },
  methods: {
    /**
     * Devuelve el nombre de la clase CSS que corresponde a cada alineamiento.
     * @param align Alineamiento de texto (left, center, right).
     * @return Nombre de la clase CSS que corresponde al alineamiento.
     */
    getAlignClass (align) {
      return ['left', 'center', 'right'].includes(align)
        ? `fura-${align}`
        : null
    }
  }
}
</script>

<template>
  <thead
    v-if="hasHeaderSlots"
    data-type="body-header"
    :data-level="isNaN(group?.level) ? undefined : group?.level"
  >
    <FuraBaseDetailsListRow
      type="group"
      :selection="selection ? 'simple' : null"
      :selected="headersSelected"
      :compact="compact"
    >
      <td v-if="collapsible" />
      <td
        v-for="(column, columnIndex) in columns"
        :key="columnIndex"
        :class="getAlignClass(column.align)"
      >
        <!--
          @slot Contenido de una celda de una cabecera. Las propiedades pueden no estar definidas siempre.
          @binding {number} groupIndex Índice de la definición del grupo.
          @binding {object} group Referencia a la definición del grupo.
          @binding {number} columnIndex Índice de la definición de la columna.
          @binding {object} column Referencia a la definición de la columna.
          @binding {Array} data Datos del grupo.
        -->
        <slot
          name="header"
          :group-index="groupIndex"
          :group="group"
          :column-index="columnIndex"
          :column="column"
          :data="data"
        />
      </td>
    </FuraBaseDetailsListRow>
  </thead>
  <tbody>
    <FuraBaseDetailsListRow
      v-for="(row, rowIndex) in currentData"
      :key="startIndex + rowIndex"
      type="data"
      :selection="selection"
      :selected="selectedIndices.includes(startIndex + rowIndex)"
      :compact="compact"
      @click="$emit('select', startIndex + rowIndex)"
      @contextmenu.stop="$emit('contextmenuRow', {
        row: startIndex + rowIndex,
        event: $event,
      })"
    >
      <td
        v-if="collapsible"
        class="fura-expanderCell"
      />
      <td
        v-for="(column, columnIndex) in columns"
        :key="columnIndex"
        :class="getAlignClass(column.align)"
        @click.stop="$emit('clickCell', {
          row: startIndex + rowIndex,
          column: columnIndex,
          event: $event
        })"
        @contextmenu.stop="$emit('contextmenuCell', {
          row: startIndex + rowIndex,
          column: columnIndex,
          event: $event
        })"
      >
        <!--
          @slot Contenido de una celda.
          @binding {number} rowIndex Índice de la fila.
          @binding {number} columnIndex Índice de la definición de la columna.
          @binding {string} content Contenido de la celda.
          @binding {object} column Referencia a la definición de la columna.
        -->
        <slot
          :row-index="startIndex + rowIndex"
          :column-index="columnIndex"
          :content="row[column.key ?? columnIndex]"
          :column="column"
        >
          <div v-text="row[column.key ?? columnIndex]?.toString()" />
        </slot>
      </td>
    </FuraBaseDetailsListRow>
  </tbody>
  <thead
    v-if="hasFooterSlots"
    data-type="body-footer"
    :data-level="isNaN(group?.level) ? undefined : group?.level"
  >
    <FuraBaseDetailsListRow
      type="group"
      :selection="selection ? 'simple' : null"
      :selected="headersSelected"
      :compact="compact"
    >
      <td v-if="collapsible" />
      <td
        v-for="(column, columnIndex) in columns"
        :key="columnIndex"
        :class="getAlignClass(column.align)"
      >
        <!--
          @slot Contenido de una celda de un pie. Las propiedades pueden no estar definidas siempre.
          @binding {number} groupIndex Índice de la definición del grupo.
          @binding {object} group Referencia a la definición del grupo.
          @binding {number} columnIndex Índice de la definición de la columna.
          @binding {object} column Referencia a la definición de la columna.
          @binding {Array} data Datos del grupo.
        -->
        <slot
          name="footer"
          :group-index="groupIndex"
          :group="group"
          :column-index="columnIndex"
          :column="column"
          :data="data"
        />
      </td>
    </FuraBaseDetailsListRow>
  </thead>
</template>

<style lang="less" scoped src="./base-details-list-body.less"></style>
