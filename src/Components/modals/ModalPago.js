import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Chip,
  Autocomplete,
} from "@mui/material";
import { Payment } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import api from "../../services/api";
import { registrarPago } from "../../services/pagosService";
import ModernModal from "./ModernModal";
import { manejarErrorApi } from "../../utils/manejarErrorApi";

const esquema = yup.object().shape({
  alumnoId: yup
    .number()
    .typeError("Selecciona un alumno válido")
    .required("El alumno es obligatorio")
    .positive("Selecciona un alumno"),
  conceptoId: yup
    .number()
    .typeError("Selecciona un concepto válido")
    .required("El concepto es obligatorio")
    .positive("Selecciona un concepto"),
  monto: yup
    .number()
    .typeError("El monto debe ser un número válido")
    .required("El monto es obligatorio")
    .positive("El monto debe ser positivo")
    .min(1, "El monto debe ser mayor a 0"),
  metodoPago: yup.string().required("El método de pago es obligatorio"),
  referencia: yup.string().nullable(),
  notas: yup.string().nullable(),
});

/**
 * Modal para registrar un nuevo pago en el sistema.
 * Permite buscar alumnos por nombre, seleccionar un concepto de pago
 * y registrar el método de pago. El monto se actualiza automáticamente
 * al seleccionar un concepto.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.abierto - Controla si el modal está visible.
 * @param {Function} props.cerrar - Callback para cerrar el modal.
 * @param {Function} props.recargar - Callback para recargar la lista de pagos tras registrar uno.
 */
export default function ModalPago({ abierto, cerrar, recargar }) {
  const [guardando, setGuardando] = useState(false);
  const [alumnos, setAlumnos] = useState([]);
  const [conceptos, setConceptos] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(esquema),
    defaultValues: {
      alumnoId: "",
      conceptoId: "",
      monto: "",
      metodoPago: "",
      referencia: "",
      notas: "",
    },
  });

  const conceptoIdWatch = watch("conceptoId");

  useEffect(() => {
    if (abierto) {
      cargarAlumnos();
      cargarConceptos();
    }
  }, [abierto]);

  useEffect(() => {
    if (conceptoIdWatch) {
      actualizarMonto();
    }
  }, [conceptoIdWatch]);

  const cargarAlumnos = async () => {
    try {
      const res = await api.get("/alumnos?activo=true");
      setAlumnos(res.data || []);
    } catch (error) {
      manejarErrorApi(error, "cargar los alumnos");
    }
  };

  const cargarConceptos = async () => {
    try {
      const res = await api.get("/conceptos?activo=true");
      setConceptos(res.data || []);
    } catch (error) {
      manejarErrorApi(error, "cargar los conceptos");
    }
  };

  const actualizarMonto = () => {
    if (!conceptoIdWatch) return;

    const concepto = conceptos.find((c) => c.id === conceptoIdWatch);
    if (concepto) {
      setValue("monto", concepto.precio);
    }
  };

  const handleClose = () => {
    if (!guardando) {
      reset();
      cerrar();
    }
  };

  const onSubmit = async (data) => {
    setGuardando(true);

    try {
      const pagoData = {
        alumnoId: data.alumnoId,
        conceptoId: data.conceptoId,
        monto: parseFloat(data.monto),
        metodoPago: data.metodoPago,
        referencia: data.referencia || null,
        notas: data.notas || null,
        alumnoInscripcionId: null,
      };

      await registrarPago(pagoData);

      Swal.fire({
        icon: "success",
        title: "Pago registrado",
        text: "El pago se ha registrado exitosamente",
        confirmButtonColor: "#d32f2f",
      });

      reset();
      cerrar();
      recargar();
    } catch (error) {
      manejarErrorApi(error, "registrar el pago");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModernModal
      open={abierto}
      onClose={handleClose}
      title="Registrar Pago"
      icon={<Payment />}
      maxWidth="sm"
      formId="form-pago"
      loading={guardando}
      submitLabel="Registrar Pago"
      loadingLabel="Registrando..."
    >
      <form id="form-pago" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="alumnoId"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                options={alumnos}
                getOptionLabel={(option) =>
                  `${option.nombre} ${option.apellidoPaterno} ${option.apellidoMaterno}`
                }
                value={alumnos.find((a) => a.id === value) || null}
                onChange={(_, newValue) => {
                  onChange(newValue ? newValue.id : "");
                }}
                disabled={guardando}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Alumno"
                    margin="normal"
                    error={!!errors.alumnoId}
                    helperText={errors.alumnoId?.message}
                    placeholder="Buscar alumno..."
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>
                        {option.nombre} {option.apellidoPaterno}{" "}
                        {option.apellidoMaterno}
                      </span>
                      {option.cintaActual && (
                        <Chip label={option.cintaActual} size="small" />
                      )}
                    </div>
                  </li>
                )}
                noOptionsText="No se encontraron alumnos"
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}
          />

          <FormControl
            fullWidth
            margin="normal"
            error={!!errors.conceptoId}
            disabled={guardando}
          >
            <InputLabel>Concepto</InputLabel>
            <Controller
              name="conceptoId"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Concepto">
                  <MenuItem value="">
                    <em>Selecciona un concepto</em>
                  </MenuItem>
                  {conceptos.map((concepto) => (
                    <MenuItem key={concepto.id} value={concepto.id}>
                      {concepto.nombre} - ${concepto.precio.toFixed(2)}
                      <Chip
                        label={concepto.tipoConcepto}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.conceptoId && (
              <FormHelperText>{errors.conceptoId?.message}</FormHelperText>
            )}
          </FormControl>

          <TextField
            label="Monto"
            type="number"
            fullWidth
            {...register("monto")}
            error={!!errors.monto}
            helperText={errors.monto?.message}
            margin="normal"
            disabled={guardando}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            inputProps={{
              step: "0.01",
              min: "0",
            }}
          />

          <FormControl
            fullWidth
            margin="normal"
            error={!!errors.metodoPago}
            disabled={guardando}
          >
            <InputLabel>Método de Pago</InputLabel>
            <Controller
              name="metodoPago"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Método de Pago">
                  <MenuItem value="">
                    <em>Selecciona un método</em>
                  </MenuItem>
                  <MenuItem value="Efectivo">Efectivo</MenuItem>
                  <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                  <MenuItem value="Transferencia">Transferencia</MenuItem>
                </Select>
              )}
            />
            {errors.metodoPago && (
              <FormHelperText>{errors.metodoPago?.message}</FormHelperText>
            )}
          </FormControl>

          <TextField
            label="Referencia (Opcional)"
            fullWidth
            {...register("referencia")}
            error={!!errors.referencia}
            helperText={
              errors.referencia?.message || "Número de transacción, folio, etc."
            }
            margin="normal"
            disabled={guardando}
          />

          <TextField
            label="Notas (Opcional)"
            fullWidth
            multiline
            rows={3}
            {...register("notas")}
            error={!!errors.notas}
            helperText={
              errors.notas?.message ||
              "Información adicional (ej: Aprobó examen Cinta Azul)"
            }
            margin="normal"
            disabled={guardando}
          />
      </form>
    </ModernModal>
  );
}
