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
    collapsible: { type: Boolean, default: false }
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
    'clickCell'
  ],
  computed: {
    /** Datos a mostrar. */
    currentData () {
      return this.data.slice(this.startIndex, this.startIndex + this.count)
    }
  }
}
</script>

<template>
  <tbody>
    <FuraBaseDetailsListRow
      v-for="(row, rowIndex) in currentData"
      :key="startIndex + rowIndex"
      type="data"
      :selection="selection"
      :selected="selectedIndices.includes(startIndex + rowIndex)"
      :compact="compact"
      @click="$emit('select', startIndex + rowIndex)"
    >
      <td
        v-if="collapsible"
        class="expanderCell"
      />
      <td
        v-for="(column, columnIndex) in columns"
        :key="columnIndex"
        :class="column.align"
        @click.stop="$emit('clickCell', {
          row: startIndex + rowIndex,
          column: columnIndex
        })"
      >
        <!--
            @slot Contenido de una celda
            @binding {string,number} column Column's key of the current cell.
            @binding {number} row Row's index of the current cell.
            @binding {string} content Content of the current cell.
        -->
        <slot
          :column="column"
          :column-index="columnIndex"
          :row="row"
          :row-index="startIndex + rowIndex"
          :content="row[column.key || columnIndex]"
        >
          <div v-text="row[column.key || columnIndex]?.toString()" />
        </slot>
      </td>
    </FuraBaseDetailsListRow>
  </tbody>
</template>

<style lang="less" scoped src="./base-details-list-body.less"></style>

<docs>
<script>
  const colors = ['Pink', 'Crimson', 'Red', 'Maroon', 'Brown', 'Misty Rose', 'Salmon', 'Coral', 'Orange-Red', 'Chocolate', 'Orange', 'Gold', 'Ivory', 'Yellow', 'Olive', 'Yellow-Green', 'Lawn green', 'Chartreuse', 'Lime', 'Green', 'Spring green', 'Aquamarine', 'Turquoise', 'Azure', 'Aqua', 'Cyan', 'Teal', 'Lavender', 'Blue', 'Navy', 'Blue-Violet', 'Indigo', 'Dark Violet', 'Plum', 'Magenta', 'Purple', 'Red-Violet', 'Tan', 'Beige', 'Slate gray', 'Dark Slate Gray', 'White', 'White Smoke', 'Light Gray', 'Silver', 'Dark Gray', 'Gray', 'Dim Gray', 'Black']
  export default {
    data () {
      const data = Array(16).fill(0).map((_, i) => ['' + i, colors[i], colors[16 + i], colors[32 + i]])
      return {
        columns: [
          {},
          { align: 'left' },
          { align: 'center' },
          { align: 'right' }
        ],
        data,
        startIndex: 0,
        count: data.length
      }
    }
  }
</script>
<template>
  <table>
    <fura-base-details-list-body
      :columns="columns"
      :data="data"
      :start-index="startIndex"
      :count="count"
    />
  </table>
</template>
</docs>