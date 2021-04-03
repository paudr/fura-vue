import Button from './component/button'
import Checkbox from './component/checkbox'
import ChoiceGroup from './component/choice-group'
import Icon from './component/icon'
import Label from './component/label'
import Spinner from './component/spinner'

const components = {
  Button,
  Checkbox,
  ChoiceGroup,
  Icon,
  Label,
  Spinner
}

export default {
  install (app, { prefix = 'fura' } = {}) {
    for (const name in components) {
      const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      app.component(`${prefix}-${kebabName}`, components[name])
    }
  },
  components
}
