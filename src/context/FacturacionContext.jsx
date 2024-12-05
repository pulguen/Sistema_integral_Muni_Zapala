// src/context/FacturacionContext.jsx 

import React, { createContext, useState, useCallback, useEffect } from "react";
import customFetch from "./CustomFetch";

export const FacturacionContext = createContext();

export const FacturacionProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [tributos, setTributos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Nuevo Estado para Módulos Registrados
  const [modules, setModules] = useState({});

  // Obtener clientes
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customFetch("/clientes");
      setClientes(data || []);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
      setError("Error al obtener los clientes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener tributos
  const fetchTributos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customFetch("/tributos");
      setTributos(data || []);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los tributos:", error);
      setError("Error al obtener los tributos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener servicios de un tributo
  const fetchServiciosByTributo = useCallback(async (tributoId) => {
    try {
      const data = await customFetch(`/tributos/${tributoId}`);
      setServicios(data.servicios || []);
    } catch (error) {
      console.error("Error al obtener los servicios:", error);
      setError("Error al obtener los servicios.");
    }
  }, []);

  // Obtener períodos
  const fetchPeriodosByClienteYServicio = useCallback(
    async (clienteId, servicioId, tributoId) => {
      try {
        const url = `/cuentas/cliente/${clienteId}/periodos?servicio_id=${servicioId}&tributo_id=${tributoId}`;
        const data = await customFetch(url);
        
        // Verificar si 'data' es una matriz de matrices
        let periods = [];
        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (Array.isArray(item)) {
              periods = periods.concat(item);
            } else {
              periods.push(item);
            }
          });
        } else {
          console.error("Formato de datos inesperado:", data);
          return [];
        }

        return (periods || []).map((periodo) => {
          const i_debito = parseFloat(periodo.i_debito) || 0;
          const i_descuento = parseFloat(periodo.i_descuento) || 0;
          const i_recargo_actualizado =
            parseFloat(periodo.i_recargo_actualizado || periodo.i_recargo) || 0;

          return {
            ...periodo,
            i_recargo_actualizado,
            total: i_debito - i_descuento + i_recargo_actualizado,
          };
        });
      } catch (error) {
        console.error("Error al obtener los períodos:", error);
        setError("Error al obtener los períodos.");
        throw error;
      }
    },
    []
  );

  // **Nueva Función: registerModule**
  const registerModule = useCallback((moduleName, moduleData) => {
    setModules((prevModules) => ({
      ...prevModules,
      [moduleName]: moduleData,
    }));
  }, []);

  // Agregar fetchClienteById
  const fetchClienteById = useCallback(async (clienteId) => {
    setLoading(true);
    try {
      const data = await customFetch(`/cuentas/cliente/${clienteId}`);
      setError(null);
      return data; // Retornamos los datos para usarlos en el componente
    } catch (error) {
      console.error("Error al obtener el cliente:", error);
      setError("Error al obtener el cliente.");
      throw error; // Relanzamos el error para manejarlo en el componente
    } finally {
      setLoading(false);
    }
  }, []);

  // **Nuevas Funciones para Gráficos**

  // 1. Obtener periodos por servicio
  const getPeriodosByServicio = useCallback(async () => {
    try {
      const data = await customFetch("/periodos/servicio");
      // Procesa los datos según tus necesidades
      return {
        labels: Object.keys(data),
        series: Object.values(data),
      };
    } catch (err) {
      console.error("Error al obtener periodos por servicio:", err);
      throw err;
    }
  }, []);

  // 2. Obtener periodos por mes
  const getPeriodosByMonth = useCallback(async () => {
    try {
      const data = await customFetch("/periodos/mes");
      return {
        categories: data.meses,
        series: [
          {
            name: 'Periodos',
            data: data.counts,
          },
        ],
      };
    } catch (err) {
      console.error("Error al obtener periodos por mes:", err);
      throw err;
    }
  }, []);

  // 3. Obtener tendencia de periodos
  const getTrendPeriodos = useCallback(async () => {
    try {
      const data = await customFetch("/periodos/trend");
      return {
        categories: data.anos,
        series: [
          {
            name: 'Tendencia',
            data: data.counts,
          },
        ],
      };
    } catch (err) {
      console.error("Error al obtener la tendencia de periodos:", err);
      throw err;
    }
  }, []);

  // 4. Obtener ingresos por servicio
  const getRevenueByService = useCallback(async () => {
    try {
      const data = await customFetch("/ingresos/servicio");
      return {
        labels: Object.keys(data),
        series: Object.values(data),
      };
    } catch (err) {
      console.error("Error al obtener ingresos por servicio:", err);
      throw err;
    }
  }, []);

  // 5. Obtener distribución de ingresos
  const getIncomeDistribution = useCallback(async () => {
    try {
      const data = await customFetch("/ingresos/distribucion");
      return {
        labels: Object.keys(data),
        series: Object.values(data),
      };
    } catch (err) {
      console.error("Error al obtener distribución de ingresos:", err);
      throw err;
    }
  }, []);

  // 6. Obtener datos para el mapa de calor
  const getHeatmapData = useCallback(async () => {
    try {
      const data = await customFetch("/periodos/heatmap");
      return data; // Asegúrate de que el formato de datos es compatible con el componente HeatmapChart
    } catch (err) {
      console.error("Error al obtener datos para el mapa de calor:", err);
      throw err;
    }
  }, []);

  // 7. Obtener KPIs
  const getKpis = useCallback(() => {
    // Aquí puedes calcular o retornar directamente los KPIs si ya están disponibles
    // Por ejemplo:
    const totalPeriodos = clientes.length; // Ejemplo
    const totalIngresos = clientes.reduce((acc, cliente) => acc + (cliente.ingresos || 0), 0); // Asegúrate de que 'ingresos' existe
    const promedioMensual = totalIngresos / 12; // Ejemplo

    return {
      totalPeriodos,
      totalIngresos,
      promedioMensual,
    };
  }, [clientes]);

  useEffect(() => {
    fetchClientes();
    fetchTributos();
  }, [fetchClientes, fetchTributos]);

  const value = {
    clientes,
    tributos,
    servicios,
    fetchClientes,
    fetchTributos,
    fetchServiciosByTributo,
    fetchPeriodosByClienteYServicio,
    fetchClienteById, // Añadido
    registerModule, // Añadido
    modules, // Opcional, si necesitas acceder a los módulos registrados
    loading,
    error,
    // Nuevas funciones para gráficos
    getPeriodosByServicio,
    getPeriodosByMonth,
    getTrendPeriodos,
    getRevenueByService,
    getIncomeDistribution,
    getHeatmapData,
    getKpis,
  };

  return (
    <FacturacionContext.Provider value={value}>
      {children}
    </FacturacionContext.Provider>
  );
};
