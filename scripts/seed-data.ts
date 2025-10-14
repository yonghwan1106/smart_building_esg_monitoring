import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function seedData() {
  console.log('Starting data seeding...');

  // 1. Create a building in Seoul
  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .insert({
      name: 'GS타워',
      address: '서울특별시 강남구 역삼동 679',
      location: 'POINT(127.0353 37.5006)' as any, // 강남역 근처
    })
    .select()
    .single();

  if (buildingError || !building) {
    console.error('Error creating building:', buildingError);
    return;
  }

  console.log('Building created:', building.name);

  // 2. Create sensors
  const sensors = [
    // Energy sensors
    {
      building_id: building.id,
      type: 'ENERGY' as const,
      name: '전체 전력 사용량',
      location_detail: '중앙 전기실',
      unit: 'kWh',
    },
    {
      building_id: building.id,
      type: 'ENERGY' as const,
      name: '10층 HVAC 전력',
      location_detail: '10층 기계실',
      unit: 'kW',
    },
    // Temperature sensors
    {
      building_id: building.id,
      type: 'TEMP' as const,
      name: '로비 온도',
      location_detail: '1층 로비',
      unit: '°C',
    },
    {
      building_id: building.id,
      type: 'TEMP' as const,
      name: '10층 사무실 온도',
      location_detail: '10층 A구역',
      unit: '°C',
    },
    // Humidity sensors
    {
      building_id: building.id,
      type: 'HUMIDITY' as const,
      name: '로비 습도',
      location_detail: '1층 로비',
      unit: '%',
    },
    // CO2 sensors
    {
      building_id: building.id,
      type: 'CO2' as const,
      name: '로비 CO2 농도',
      location_detail: '1층 로비',
      unit: 'ppm',
    },
    {
      building_id: building.id,
      type: 'CO2' as const,
      name: '10층 사무실 CO2',
      location_detail: '10층 A구역',
      unit: 'ppm',
    },
    // Facility sensors
    {
      building_id: building.id,
      type: 'DOOR_STATUS' as const,
      name: '장애인 화장실 자동문',
      location_detail: '1층 장애인 화장실',
      unit: 'status',
    },
    {
      building_id: building.id,
      type: 'ELEVATOR_STATUS' as const,
      name: '승강기 1호기',
      location_detail: '1층 홀',
      unit: 'status',
    },
    {
      building_id: building.id,
      type: 'CHARGER_STATUS' as const,
      name: '휠체어 충전기',
      location_detail: '1층 로비',
      unit: 'status',
    },
  ];

  const { data: createdSensors, error: sensorsError } = await supabase
    .from('sensors')
    .insert(sensors)
    .select();

  if (sensorsError || !createdSensors) {
    console.error('Error creating sensors:', sensorsError);
    return;
  }

  console.log(`Created ${createdSensors.length} sensors`);

  // 3. Create sensor readings for the past 24 hours
  const now = new Date();
  const readings = [];

  for (const sensor of createdSensors) {
    // Generate hourly readings for the past 24 hours
    for (let i = 24; i >= 0; i--) {
      const readTime = new Date(now.getTime() - i * 60 * 60 * 1000);
      let value = 0;

      switch (sensor.type) {
        case 'ENERGY':
          if (sensor.name.includes('전체')) {
            // Total power: 200-400 kWh with some variation
            value = 250 + Math.random() * 150 + (i < 12 ? 50 : 0); // Higher during day
            // Add anomaly at hour 10 (10 hours ago)
            if (i === 10) value += 150; // Spike for anomaly detection
          } else {
            // HVAC power: 20-40 kW
            value = 25 + Math.random() * 15 + (i < 12 ? 10 : 0);
            // Anomaly for empty floor
            if (i <= 5) value += 30; // Recent spike
          }
          break;
        case 'TEMP':
          // Temperature: 20-24°C
          value = 22 + Math.random() * 2;
          break;
        case 'HUMIDITY':
          // Humidity: 40-60%
          value = 50 + Math.random() * 10;
          break;
        case 'CO2':
          // CO2: 400-800 ppm
          value = 500 + Math.random() * 300 + (i < 12 ? 100 : 0);
          break;
        case 'DOOR_STATUS':
        case 'ELEVATOR_STATUS':
        case 'CHARGER_STATUS':
          // Status: 1 = operational, 0 = error
          value = i > 2 ? 1 : 0; // Error in last 2 hours
          break;
      }

      readings.push({
        sensor_id: sensor.id,
        value: Number(value.toFixed(2)),
        read_at: readTime.toISOString(),
      });
    }
  }

  const { error: readingsError } = await supabase
    .from('sensor_readings')
    .insert(readings);

  if (readingsError) {
    console.error('Error creating sensor readings:', readingsError);
    return;
  }

  console.log(`Created ${readings.length} sensor readings`);

  // 4. Create alerts based on anomalies
  const alerts = [
    {
      sensor_id: createdSensors.find(s => s.name === '10층 HVAC 전력')?.id,
      alert_type: 'ANOMALY' as const,
      severity: 'CRITICAL' as const,
      title: '10층 HVAC 시스템 전력 사용량 이상 패턴 감지',
      description: '평소 대비 비정상적인 전력 사용 패턴이 감지되었습니다. 공실 구역에서 지속적인 전력 소비가 발생하고 있습니다.',
      status: 'NEW' as const,
      triggered_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      sensor_id: createdSensors.find(s => s.name === '장애인 화장실 자동문')?.id,
      alert_type: 'FACILITY_ERROR' as const,
      severity: 'CRITICAL' as const,
      title: '장애인 화장실 자동문 작동 불능',
      description: '1층 장애인 화장실 자동문이 정상적으로 작동하지 않습니다. 즉시 점검이 필요합니다.',
      status: 'NEW' as const,
      triggered_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      sensor_id: createdSensors.find(s => s.name === '전체 전력 사용량')?.id,
      alert_type: 'THRESHOLD' as const,
      severity: 'WARNING' as const,
      title: '전력 사용량 임계치 초과',
      description: '건물 전체 전력 사용량이 설정된 임계치를 초과했습니다.',
      status: 'ACKNOWLEDGED' as const,
      triggered_at: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
      acknowledged_at: new Date(now.getTime() - 9 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const { data: createdAlerts, error: alertsError } = await supabase
    .from('alerts')
    .insert(alerts.filter(a => a.sensor_id))
    .select();

  if (alertsError) {
    console.error('Error creating alerts:', alertsError);
    return;
  }

  console.log(`Created ${createdAlerts?.length || 0} alerts`);

  console.log('✅ Data seeding completed successfully!');
}

seedData().catch(console.error);
