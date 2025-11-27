import {
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    CircularProgress,
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
        .nullable()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .test('curp-valido', 'Ingresa un CURP válido de 18 caracteres', function(value) {
            if (!value) return true; // CURP es opcional
            return /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(value) && value.length === 18;
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
            const [resCintas, resClases, resConceptos] = await Promise.all([
                api.get("/cintas?activo=true"),
                api.get("/clases?activo=true"),
                api.get("/conceptos?activo=true&tipoConcepto=Mensualidad"),
            ]);

            // Ordenar cintas por jerarquía (orden)
            const cintasOrdenadas = (resCintas.data || []).sort((a, b) => a.orden - b.orden);

            setCintas(cintasOrdenadas);
            setClases(resClases.data || []);
            setConceptos(resConceptos.data || []);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron cargar los datos necesarios",
                confirmButtonColor: "#d32f2f",
            });
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
            // Convertir valores vacíos a null y asignar "No" por defecto a enfermedades
            const payload = {
                ...data,
                curp: data.curp ? data.curp.toUpperCase() : null,
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
            let mensajeError = "Ocurrió un error inesperado al guardar el alumno";
            let detalles = "";

            if (error.response) {
                if (error.response.status === 400) {
                    mensajeError = "Datos inválidos";
                    detalles = error.response.data?.message || "Verifica que todos los datos sean correctos";
                } else if (error.response.status === 409) {
                    mensajeError = "Alumno duplicado";
                    detalles = error.response.data?.message || "Ya existe un alumno con estos datos.";
                } else {
                    mensajeError = "Error del servidor";
                    detalles = "No se pudo guardar el alumno. Intenta nuevamente.";
                }
            } else if (error.request) {
                mensajeError = "Sin conexión";
                detalles =
                    "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
            }

            Swal.fire({
                icon: "error",
                title: mensajeError,
                text: detalles,
                confirmButtonColor: "#d32f2f",
            });
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
            actions={
                <>
                    <Button
                        onClick={handleClose}
                        className="modal-button-secondary"
                        disabled={guardando}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="form-crear-socio"
                        className="modal-button-primary"
                        disabled={guardando}
                        startIcon={guardando && <CircularProgress size={20} />}
                    >
                        {guardando ? "Guardando..." : "Guardar"}
                    </Button>
                </>
            }
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
