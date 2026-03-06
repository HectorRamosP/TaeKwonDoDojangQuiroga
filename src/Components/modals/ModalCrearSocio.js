/** @module components/modals/ModalCrearSocio */
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import api from "../../services/api";
import ModernModal from "./ModernModal";
import { manejarErrorApi } from "../../utils/manejarErrorApi";

const esquema = yup.object().shape({
    nombre: yup
        .string()
        .required("El nombre es obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres"),
    apellidoPaterno: yup
        .string()
        .required("El apellido paterno es obligatorio")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(100, "El apellido no puede exceder 100 caracteres"),
    apellidoMaterno: yup
        .string()
        .required("El apellido materno es obligatorio")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(100, "El apellido no puede exceder 100 caracteres"),
    curp: yup
        .string()
        // Convierte cadenas vacías a null para que .nullable() las acepte sin error
        .transform((value, originalValue) => {
            if (!originalValue || originalValue === "" || originalValue.trim() === "") return null;
            return originalValue;
        })
        .nullable()
        .notRequired()
        // Se usa .test() en vez de .matches() para poder omitir la validación cuando el valor es null/vacío
        .test('curp-valido', 'Ingresa un CURP válido de 18 caracteres', function(value) {
            if (!value) return true;
            const valorLimpio = value.trim();
            if (valorLimpio === "") return true;
            return /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(valorLimpio) && valorLimpio.length === 18;
        }),
    enfermedades: yup
        .string()
        .nullable()
        .max(500, "El campo de enfermedades no puede exceder 500 caracteres"),
    fechaNacimiento: yup
        .date()
        .required("La fecha de nacimiento es obligatoria")
        .max(new Date(), "La fecha no puede ser futura"),
    direccion: yup.string().nullable(),
    sexo: yup.string().nullable(),
    nombreTutor: yup
        .string()
        .required("El nombre del tutor es obligatorio")
        .min(2, "El nombre del tutor debe tener al menos 2 caracteres")
        .max(200, "El nombre del tutor no puede exceder 200 caracteres"),
    telefonoTutor: yup
        .string()
        .required("El teléfono del tutor es obligatorio")
        .matches(/^[0-9]{10}$/, "Ingresa un teléfono válido de 10 dígitos"),
    emailTutor: yup
        .string()
        .required("El email del tutor es obligatorio")
        .email("Ingresa un email válido")
        .max(150, "El email no puede exceder 150 caracteres"),
    cintaActualId: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? null : value)),
    claseId: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? null : value)),
    conceptoMensualidadId: yup
        .number()
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? null : value)),
});

/**
 * Modal para registrar un nuevo alumno en el sistema.
 * Incluye validación de formulario con Yup y carga dinámica de cintas,
 * clases y conceptos de mensualidad disponibles.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.abierto - Controla si el modal está visible.
 * @param {Function} props.cerrar - Callback para cerrar el modal.
 * @param {Function} props.recargar - Callback para recargar la lista de alumnos tras crear uno.
 */
export default function ModalCrearSocio({ abierto, cerrar, recargar }) {
    const [guardando, setGuardando] = useState(false);
    const [cintas, setCintas] = useState([]);
    const [clases, setClases] = useState([]);
    const [conceptos, setConceptos] = useState([]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(esquema),
        defaultValues: {
            nombre: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            curp: "",
            enfermedades: "",
            fechaNacimiento: "",
            direccion: "",
            sexo: "",
            nombreTutor: "",
            telefonoTutor: "",
            emailTutor: "",
            cintaActualId: "",
            claseId: "",
            conceptoMensualidadId: "",
        },
    });

    useEffect(() => {
        if (abierto) {
            cargarDatos();
        }
    }, [abierto]);

    const cargarDatos = async () => {
        try {
            // Las 3 peticiones se hacen en paralelo para reducir el tiempo de carga del modal
            const [resCintas, resClases, resConceptos] = await Promise.all([
                api.get("/cintas?activo=true"),
                api.get("/clases?activo=true"),
                api.get("/conceptos?activo=true&tipoConcepto=Mensualidad"),
            ]);

            // Las cintas se ordenan por su campo 'orden' para mostrarlas de menor a mayor grado
            const cintasOrdenadas = (resCintas.data || []).sort((a, b) => a.orden - b.orden);

            setCintas(cintasOrdenadas);
            setClases(resClases.data || []);
            setConceptos(resConceptos.data || []);
        } catch (error) {
            manejarErrorApi(error, "cargar los datos necesarios");
        }
    };

    const handleClose = () => {
        // Bloquea el cierre mientras se está guardando para evitar cancelar la petición a la mitad
        if (!guardando) {
            reset();
            cerrar();
        }
    };

    const onSubmit = async (data) => {
        setGuardando(true);

        try {
            const payload = {
                ...data,
                // El CURP siempre se guarda en mayúsculas; si viene vacío se envía null
                curp: data.curp ? data.curp.toUpperCase() : null,
                // Si no se especifican enfermedades se guarda "No" en lugar de cadena vacía
                enfermedades: data.enfermedades?.trim() || "No",
                cintaActualId: data.cintaActualId || null,
                claseId: data.claseId || null,
                conceptoMensualidadId: data.conceptoMensualidadId || null,
                direccion: data.direccion || null,
                sexo: data.sexo || null,
            };

            await api.post("/alumnos", payload);

            Swal.fire({
                icon: "success",
                title: "Alumno creado",
                text: "El alumno se ha registrado exitosamente",
                confirmButtonColor: "#d32f2f",
            });

            reset();
            cerrar();
            recargar();
        } catch (error) {
            manejarErrorApi(error, "guardar el alumno");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <ModernModal
            open={abierto}
            onClose={handleClose}
            title="Nuevo Alumno"
            icon={<PersonAdd />}
            maxWidth="md"
            formId="form-crear-socio"
            loading={guardando}
        >
            <form id="form-crear-socio" onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: "#666", fontWeight: "bold" }}>
                    Datos del Alumno
                </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField
                            label="Nombre"
                            fullWidth
                            {...register("nombre")}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                            disabled={guardando}
                            autoFocus
                        />
                        <TextField
                            label="Apellido Paterno"
                            fullWidth
                            {...register("apellidoPaterno")}
                            error={!!errors.apellidoPaterno}
                            helperText={errors.apellidoPaterno?.message}
                            disabled={guardando}
                        />
                        <TextField
                            label="Apellido Materno"
                            fullWidth
                            {...register("apellidoMaterno")}
                            error={!!errors.apellidoMaterno}
                            helperText={errors.apellidoMaterno?.message}
                            disabled={guardando}
                        />
                        <TextField
                            label="Fecha de Nacimiento"
                            type="date"
                            fullWidth
                            {...register("fechaNacimiento")}
                            error={!!errors.fechaNacimiento}
                            helperText={errors.fechaNacimiento?.message}
                            disabled={guardando}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <FormControl fullWidth disabled={guardando}>
                            <InputLabel>Sexo</InputLabel>
                            <Controller
                                name="sexo"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} label="Sexo">
                                        <MenuItem value="">
                                            <em>Seleccionar</em>
                                        </MenuItem>
                                        <MenuItem value="Masculino">Masculino</MenuItem>
                                        <MenuItem value="Femenino">Femenino</MenuItem>
                                    </Select>
                                )}
                            />
                        </FormControl>
                        <TextField
                            label="Dirección"
                            fullWidth
                            {...register("direccion")}
                            error={!!errors.direccion}
                            helperText={errors.direccion?.message}
                            disabled={guardando}
                        />
                        <TextField
                            label="CURP (18 caracteres) - Opcional"
                            fullWidth
                            {...register("curp")}
                            error={!!errors.curp}
                            helperText={errors.curp?.message || "Deja en blanco si no tienes el CURP"}
                            disabled={guardando}
                            inputProps={{ maxLength: 18, style: { textTransform: 'uppercase' } }}
                            placeholder="Opcional"
                        />
                        <TextField
                            label="Enfermedades (Opcional)"
                            fullWidth
                            multiline
                            rows={2}
                            {...register("enfermedades")}
                            error={!!errors.enfermedades}
                            helperText={errors.enfermedades?.message || "Deja en blanco si no tiene enfermedades"}
                            disabled={guardando}
                            placeholder="Ej: Asma, Diabetes, etc."
                        />
                    </Box>

                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 2, color: "#666", fontWeight: "bold" }}>
                        Datos del Tutor Responsable
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <TextField
                            label="Nombre del Tutor"
                            fullWidth
                            {...register("nombreTutor")}
                            error={!!errors.nombreTutor}
                            helperText={errors.nombreTutor?.message}
                            disabled={guardando}
                        />
                        <TextField
                            label="Teléfono del Tutor (10 dígitos)"
                            fullWidth
                            {...register("telefonoTutor")}
                            error={!!errors.telefonoTutor}
                            helperText={errors.telefonoTutor?.message}
                            disabled={guardando}
                        />
                        <TextField
                            label="Email del Tutor"
                            type="email"
                            fullWidth
                            {...register("emailTutor")}
                            error={!!errors.emailTutor}
                            helperText={errors.emailTutor?.message}
                            disabled={guardando}
                            sx={{ gridColumn: "span 2" }}
                        />
                    </Box>

                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 2, color: "#666", fontWeight: "bold" }}>
                        Información de Entrenamiento (Opcional)
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <FormControl fullWidth disabled={guardando}>
                            <InputLabel>Cinta Actual</InputLabel>
                            <Controller
                                name="cintaActualId"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} label="Cinta Actual">
                                        <MenuItem value="">
                                            <em>Sin cinta asignada</em>
                                        </MenuItem>
                                        {cintas.map((cinta) => (
                                            <MenuItem key={cinta.id} value={cinta.id}>
                                                {cinta.nombre}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                        <FormControl fullWidth disabled={guardando}>
                            <InputLabel>Clase/Horario</InputLabel>
                            <Controller
                                name="claseId"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} label="Clase/Horario">
                                        <MenuItem value="">
                                            <em>Sin clase asignada</em>
                                        </MenuItem>
                                        {clases.map((clase) => (
                                            <MenuItem key={clase.id} value={clase.id}>
                                                {clase.nombre} - {clase.dias}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                        <FormControl fullWidth disabled={guardando} sx={{ gridColumn: "span 2" }}>
                            <InputLabel>Mensualidad Contratada</InputLabel>
                            <Controller
                                name="conceptoMensualidadId"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} label="Mensualidad Contratada">
                                        <MenuItem value="">
                                            <em>Sin mensualidad</em>
                                        </MenuItem>
                                        {conceptos.map((concepto) => (
                                            <MenuItem key={concepto.id} value={concepto.id}>
                                                {concepto.nombre} - ${concepto.precio}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                        </FormControl>
                    </Box>
            </form>
        </ModernModal>
    );
}
