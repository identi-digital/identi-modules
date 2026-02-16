import React from 'react';
import Autocomplete from '@ui/components/atoms/Autocomplete/Autocomplete';
import SelectField from '@ui/components/atoms/SelectField/SelectField';
import TextField from '@ui/components/atoms/TextField/TextField';
import MediaComponent from '../../../../../ui/components/molecules/MediaComponent';
import { EntityDetailMetadata } from '@modules/forms/src/models/entities';
import { evaluate } from 'mathjs';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import {
  FormControl,
  FormGroup,
  Popover,
  Autocomplete as AutocompleteMaterial,
  TextField as TextFieldMaterial,
} from '@mui/material';
import { Close } from '@mui/icons-material';

type Option = {
  id: string;
  display_name: string;
  description: string;
  module_name?: string;
  owner?: string;
};

type entityValues = {
  instruction_id: string;
  values: Option[];
};

type FieldEntityProps = {
  element: any;
  errors: any;
  touched: any;
  entityDetail: EntityDetailMetadata[];
  updateEntityDetail: (id: string, value: any) => void;
  entityValuesArray: any;
  updateEntityFieldValue: (id: string, name: string, value: any) => void;
  isEdit: boolean;
  viewMode?: boolean;
  itemValue?: string;
  renderItem?: (item: any) => React.ReactNode;
  renderOption?: (item: any) => React.ReactNode;
  loadMoreEntityValues?: (params: any) => void;
  // producerSelected?: any;
  //   disabled: boolean;
};

const FieldEntity: React.FC<FieldEntityProps> = (props: FieldEntityProps) => {
  const {
    element,
    errors,
    touched,
    updateEntityDetail,
    viewMode,
    entityValuesArray,
    updateEntityFieldValue,
    // loadMoreEntityValues,
    isEdit,
    entityDetail,
    itemValue,
    renderItem,
    renderOption,
    // producerSelected
  } = props;

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-popover' : undefined;

  console.log(element);

  if (element.type_value === 'option') {
    // console.log(element);
    const isMultiple =
      element?.metadata?.data_input?.sub_type === 'list' || false;
    return (
      <SelectField
        id={element.name}
        label={''}
        name={element?.metadata?.data_input?.title ?? element.name}
        items={element.option ?? []}
        disabled={element.is_unique === true && isEdit}
        itemText="value"
        variant="outlined"
        multiple={isMultiple}
        itemValue={itemValue || 'value'}
        errors={errors}
        touched={touched}
        value={element.value}
        onChange={(_name: any, value: any) => {
          // console.log(value);
          if (Array.isArray(value) && isMultiple) {
            const options = value.map((element: any) =>
              itemValue ? element[itemValue] : String(element),
            );
            updateEntityDetail(element.id, options);
          } else {
            updateEntityDetail(element.id, value);
          }
        }}
      />
    );
  }
  if (element.type_value === 'date') {
    let date: string = '';
    if (element.value) {
      // console.log(element.value);
      date = new Date(element.value).toLocaleDateString();
    }
    return (
      <div style={{ paddingTop: '8px' }}>
        <FormGroup row>
          <FormControl
            fullWidth
            variant={'standard'}
            size="small"
            // className={clsx(classes.root,
            // errors?.[name] && touched?.[name] && Boolean(errors[name]) && classes.error)}
          >
            <TextField
              aria-describedby={id}
              onClick={handleClick}
              size="small"
              id={element.name}
              variant="outlined"
              label={''}
              autoComplete="off"
              name={element?.metadata?.data_input?.title ?? element.name}
              value={date}
              errors={errors}
              touched={touched}
              InputProps={
                element.value
                  ? {
                      endAdornment: (
                        <Close
                          onClick={() => {
                            updateEntityDetail(element.id, '');
                            // handleClose();
                          }}
                          sx={{
                            cursor: 'pointer',
                          }}
                        />
                      ),
                    }
                  : {}
              }
            />
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <Calendar
                date={element.value}
                onChange={(dateSelected: any) => {
                  // console.log(date);
                  updateEntityDetail(element.id, dateSelected);
                  handleClose();
                }}
              />
            </Popover>
          </FormControl>
        </FormGroup>
      </div>
      // <DatePicker
      //   id={element.name}
      //   label={''}
      //   name={element.name}
      //   onChange={(value: any, _name: any, _keyboardInputValue?: string | undefined) => {
      //     const dateValue = moment(value).format('DD/MM/YYYY');
      //     updateEntityDetail(element.id, dateValue);
      //   }}
      //   errors={errors}
      //   touched={touched}
      //   value={moment(element.value, 'DD/MM/YYYY')}
      //   // style={{ marginTop: '8px' }}
      // />
    );
  }
  if (element.type_value === 'entity') {
    // let arrFiltered = [];

    // if (element?.instruction_id === '7223c167-110a-4e42-a529-a0b0819f9e4a' && producerSelected) {
    //   // console.log(element);
    //   const values =
    //     entityValuesArray.find((value: entityValues) =>
    // value.instruction_id === element.instruction_id)?.values ?? [];
    //   // console.log(values);
    //   if (values.length > 0) {
    //     arrFiltered = values.filter((value: Option) => value.owner === producerSelected.id);
    //   }

    // console.log(entityValuesArray);
    // } else {
    //   arrFiltered =
    //     entityValuesArray.find((value: entityValues) =>
    // value.instruction_id === element.instruction_id)?.values ?? [];
    // }
    // const isMultiple = true;
    const isMultiple = element?.metadata?.data_input?.is_multiple ?? false;
    const config = entityValuesArray.find(
      (value: entityValues) => value.instruction_id === element.instruction_id,
    );
    const options = config?.values ?? [];
    console.log(config);
    if (isMultiple) {
      return (
        <AutocompleteMaterial
          multiple
          id="tags-standard"
          options={options}
          getOptionLabel={(option: any) => option.display_name}
          defaultValue={[]}
          sx={{ paddingBlock: 1 }}
          onChange={(_event: any, newValue: any) => {
            console.log(newValue);
            const newVal = newValue.map((value: any) => {
              return {
                id: value.id,
                display_name: value.display_name,
              };
            });

            updateEntityFieldValue(element.id, element.name, newVal);
          }}
          renderInput={(params) => (
            <TextFieldMaterial
              {...params}
              variant="outlined"
              size="small"
              label=""
              placeholder=""
            />
          )}
        />
      );
    }
    return (
      <Autocomplete
        id={element.name}
        label={''}
        name={element?.metadata?.data_input?.title ?? element.name}
        // isDataLoading={config?.loading ?? false}
        // onInputChange={(search) => {
        //   // console.log(search);
        //   return new Promise(async (resolve) => {
        //     const val = entityValuesArray.find(
        //       (value: any) => value.instruction_id === element.instruction_id,
        //     );
        //     console.log(val);
        //     if (val) {
        //       loadMoreEntityValues &&
        //         (await loadMoreEntityValues({
        //           idSelected: val.idSelected,
        //           instruction_id: element.instruction_id,
        //           search,
        //           page: 1,
        //           append: true,
        //         }));
        //       resolve(true);
        //     }
        //   });
        // }}
        onChange={(_name: any, value: any) => {
          console.log(value);
          const entityArr = entityValuesArray.find(
            (value: entityValues) =>
              value.instruction_id === element.instruction_id,
          );
          if (entityArr?.values) {
            console.log(entityArr);
            const option = entityArr?.values.find(
              (element: any) => element.id === value,
            );
            console.log(option);
            if (option) {
              updateEntityFieldValue(element.id, element.name, {
                id: option.id,
                display_name: option.display_name,
              });
            }
          }
        }}
        value={element.value}
        itemText="display_name"
        disabled={element.is_unique === true && isEdit}
        itemValue="id"
        errors={errors}
        renderItem={(item) => {
          // console.log(item);
          if (renderItem) {
            return renderItem(item);
          }
          return item['display_name'];
        }}
        renderOption={renderOption}
        touched={touched}
        selectedValue={element.value}
        items={
          entityValuesArray.find(
            (value: entityValues) =>
              value.instruction_id === element.instruction_id,
          )?.values ?? []
        }
        defaultValue={null}
      />
    );
  }
  if (element.type_value === 'number') {
    if (element.metadata?.data_input?.type === 'calculator') {
      // Si el campo es un número de calculadora ejecuto la expresión
      const expression = element.metadata?.data_input?.expresion ?? '';

      // quiero construir un objeto con todas las variables del formulario
      const varriables: Record<string, any> = {};

      entityDetail.forEach((detail: EntityDetailMetadata) => {
        varriables[detail?.name] = detail?.value ?? '';
      });

      // Verifico si todas las variables que estan en la expresion estan en el objeto
      // si no estan el valueCalculator sera '' y no se ejecutara la expresion
      // Si todas las variables estan en el objeto ejecuto la expresion y lo guardo en valueCalculator
      let valueCalculator = expression;
      const var_need = expression.match(/{{(.*?)}}/g);
      let result = '';
      if (var_need && varriables) {
        var_need.forEach((var_need: string) => {
          const var_name = var_need
            .replace('{{', '')
            .replace('}}', '')
            .trim();
          if (var_name) {
            if (varriables[var_name] && varriables[var_name] !== '') {
              valueCalculator = valueCalculator.replace(
                var_need,
                varriables[var_name],
              );
            }
          }
        });
        const var_need2 = valueCalculator.match(/{{(.*?)}}/g);
        if ((!var_need2 || var_need2?.length === 0) && valueCalculator !== '') {
          result = evaluate(valueCalculator);
          if (element.value !== result) {
            updateEntityDetail(element.id, result);
          }
        } else {
          result = '';
          if (element.value !== result) {
            updateEntityDetail(element.id, result);
          }
        }
      }

      return (
        <TextField
          id={element.name}
          variant="outlined"
          size="small"
          placeholder={'Por calcular'}
          type={'number'}
          disabled={true}
          label=""
          name={element?.metadata?.data_input?.title ?? element.name}
          onChange={(e: any) => {
            let inputValue = e.target.value;
            // Permitir valores decimales como 0.1, pero no números como 000123
            if (inputValue === '0' || inputValue === '0.') {
              updateEntityDetail(element.id, inputValue);
            } else if (inputValue.match(/^0\d+/)) {
              // Si el número empieza con 0 seguido de más dígitos, elimina los ceros iniciales
              inputValue = inputValue.replace(/^0+/, '');
              updateEntityDetail(element.id, inputValue);
            } else if (!isNaN(inputValue) || inputValue === '') {
              // Permitir solo números y dejar vacío el campo si el usuario lo limpia
              updateEntityDetail(element.id, inputValue);
            }
          }}
          errors={errors}
          touched={touched}
          value={element.value}
          style={{ marginTop: '8px' }}
        />
      );
    }
    return (
      <TextField
        id={element.name}
        variant="outlined"
        size="small"
        label={''}
        type={'number'}
        disabled={element.is_unique === true && isEdit}
        name={element?.metadata?.data_input?.title ?? element.name}
        onChange={(e: any) => {
          let inputValue = e.target.value;
          // Permitir valores decimales como 0.1, pero no números como 000123
          if (inputValue === '0' || inputValue === '0.') {
            updateEntityDetail(element.id, inputValue);
          } else if (inputValue.match(/^0\d+/)) {
            // Si el número empieza con 0 seguido de más dígitos, elimina los ceros iniciales
            inputValue = inputValue.replace(/^0+/, '');
            updateEntityDetail(element.id, inputValue);
          } else if (!isNaN(inputValue) || inputValue === '') {
            // Permitir solo números y dejar vacío el campo si el usuario lo limpia
            updateEntityDetail(element.id, inputValue);
          }
        }}
        errors={errors}
        touched={touched}
        value={element.value}
        style={{ marginTop: '8px' }}
      />
    );
  }
  if (element.type_value === 'boolean') {
    if (typeof element.value === 'string') {
      element.value = element.value.toLowerCase() === 'true' ? true : false;
    }
    return (
      <SelectField
        id={element.name}
        label={''}
        name={element?.metadata?.data_input?.title ?? element.name}
        items={[
          { id: true, value: 'Si' },
          { id: false, value: 'No' },
        ]}
        itemText="value"
        variant="outlined"
        disabled={element.is_unique === true && isEdit}
        itemValue="id"
        errors={errors}
        touched={touched}
        value={element.value}
        onChange={(_name: any, value: any) => {
          updateEntityDetail(element.id, value);
        }}
      />
    );
  }
  if (element.type_value === 'media') {
    return (
      <MediaComponent
        element={element}
        errors={errors}
        touched={touched}
        updateEntityDetail={updateEntityDetail}
        entityValuesArray={entityValuesArray}
        updateEntityFieldValue={updateEntityFieldValue}
        isEdit={isEdit}
        viewMode={viewMode}
      />
    );
  }
  return (
    <TextField
      id={element.name}
      variant="outlined"
      size="small"
      label={''}
      type={'text'}
      disabled={element.is_unique === true && isEdit}
      name={element?.metadata?.data_input?.title ?? element.name}
      onChange={(e: any) => {
        updateEntityDetail(element.id, e.target.value);
      }}
      errors={errors}
      touched={touched}
      value={element.value}
      style={{ marginTop: '8px' }}
    />
  );
};

export default FieldEntity;
