import { useState, useEffect, useMemo } from 'react';

const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary', desc: 'Little or no regular exercise' },
  { value: 1.375, label: 'Lightly Active', desc: 'Exercise 1–3 days/week' },
  { value: 1.55, label: 'Moderately Active', desc: 'Exercise 3–5 days/week' },
  { value: 1.725, label: 'Very Active', desc: 'Hard exercise 6–7 days/week' },
  { value: 1.9, label: 'Extra Active', desc: 'Athlete or physical labor job' }
];

function FitnessCalculator() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('bmi'); // 'bmi', 'tdee', 'heart_rate'
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric', 'imperial'

  // Biometrics state with localStorage persistence
  const [gender, setGender] = useState(() => localStorage.getItem('calc_gender') || 'male');
  const [age, setAge] = useState(() => localStorage.getItem('calc_age') || '28');
  const [heightCm, setHeightCm] = useState(() => localStorage.getItem('calc_height_cm') || '175');
  const [weightKg, setWeightKg] = useState(() => localStorage.getItem('calc_weight_kg') || '72');
  const [heightInches, setHeightInches] = useState(() => localStorage.getItem('calc_height_in') || '69');
  const [weightLbs, setWeightLbs] = useState(() => localStorage.getItem('calc_weight_lbs') || '158');
  const [activityFactor, setActivityFactor] = useState(() => Number(localStorage.getItem('calc_activity')) || 1.55);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('calc_gender', gender);
    localStorage.setItem('calc_age', age);
    localStorage.setItem('calc_height_cm', heightCm);
    localStorage.setItem('calc_weight_kg', weightKg);
    localStorage.setItem('calc_height_in', heightInches);
    localStorage.setItem('calc_weight_lbs', weightLbs);
    localStorage.setItem('calc_activity', String(activityFactor));
  }, [gender, age, heightCm, weightKg, heightInches, weightLbs, activityFactor]);

  // Normalize metrics for calculation (always in kg and cm internally)
  const normWeightKg = useMemo(() => {
    if (unitSystem === 'metric') return parseFloat(weightKg) || 0;
    return (parseFloat(weightLbs) || 0) * 0.453592;
  }, [unitSystem, weightKg, weightLbs]);

  const normHeightCm = useMemo(() => {
    if (unitSystem === 'metric') return parseFloat(heightCm) || 0;
    return (parseFloat(heightInches) || 0) * 2.54;
  }, [unitSystem, heightCm, heightInches]);

  const numAge = parseFloat(age) || 25;

  // 1. BMI Calculation
  const { bmi, bmiCategory, bmiColor, healthyWeightRange } = useMemo(() => {
    if (normWeightKg <= 0 || normHeightCm <= 0) {
      return { bmi: 0, bmiCategory: 'Enter Values', bmiColor: 'var(--text-muted)', healthyWeightRange: '' };
    }

    const heightMeters = normHeightCm / 100;
    const val = normWeightKg / (heightMeters * heightMeters);
    const rounded = Math.round(val * 10) / 10;

    let cat = 'Normal Weight';
    let color = 'var(--success)';

    if (val < 18.5) {
      cat = 'Underweight';
      color = 'var(--primary)';
    } else if (val < 25.0) {
      cat = 'Normal Weight';
      color = 'var(--success)';
    } else if (val < 30.0) {
      cat = 'Overweight';
      color = 'var(--warning)';
    } else {
      cat = 'Obese';
      color = 'var(--danger)';
    }

    // Healthy weight range (BMI 18.5 - 24.9)
    const minW = Math.round(18.5 * heightMeters * heightMeters);
    const maxW = Math.round(24.9 * heightMeters * heightMeters);

    let rangeStr = `${minW} – ${maxW} kg`;
    if (unitSystem === 'imperial') {
      const minLbs = Math.round(minW * 2.20462);
      const maxLbs = Math.round(maxW * 2.20462);
      rangeStr = `${minLbs} – ${maxLbs} lbs`;
    }

    return { bmi: rounded, bmiCategory: cat, bmiColor: color, healthyWeightRange: rangeStr };
  }, [normWeightKg, normHeightCm, unitSystem]);

  // 2. BMR & TDEE Calculation (Mifflin-St Jeor)
  const { bmr, tdee, fatLossTarget, muscleGainTarget } = useMemo(() => {
    if (normWeightKg <= 0 || normHeightCm <= 0 || numAge <= 0) {
      return { bmr: 0, tdee: 0, fatLossTarget: 0, muscleGainTarget: 0 };
    }

    let baseBmr = (10 * normWeightKg) + (6.25 * normHeightCm) - (5 * numAge);
    if (gender === 'male') {
      baseBmr += 5;
    } else {
      baseBmr -= 161;
    }

    const roundedBmr = Math.round(baseBmr);
    const roundedTdee = Math.round(roundedBmr * activityFactor);

    return {
      bmr: roundedBmr,
      tdee: roundedTdee,
      fatLossTarget: Math.max(1200, roundedTdee - 500),
      muscleGainTarget: roundedTdee + 300
    };
  }, [normWeightKg, normHeightCm, numAge, gender, activityFactor]);

  // 3. Heart Rate Training Zones (220 - age)
  const { maxHr, zones } = useMemo(() => {
    const max = Math.max(100, 220 - numAge);

    const zoneDefs = [
      { name: 'Zone 1: Active Recovery', pct: '50–60%', min: Math.round(max * 0.5), max: Math.round(max * 0.6), color: 'var(--text-light)', desc: 'Warm-up & easy recovery' },
      { name: 'Zone 2: Fat Burn & Base', pct: '60–70%', min: Math.round(max * 0.6), max: Math.round(max * 0.7), color: 'var(--success)', desc: 'Aerobic base & fat metabolism' },
      { name: 'Zone 3: Aerobic Cardio', pct: '70–80%', min: Math.round(max * 0.7), max: Math.round(max * 0.8), color: 'var(--primary)', desc: 'Stamina & cardio endurance' },
      { name: 'Zone 4: Anaerobic Threshold', pct: '80–90%', min: Math.round(max * 0.8), max: Math.round(max * 0.9), color: 'var(--warning)', desc: 'High speed & lactate tolerance' },
      { name: 'Zone 5: VO2 Max Peak', pct: '90–100%', min: Math.round(max * 0.9), max: max, color: 'var(--danger)', desc: 'All-out interval sprint effort' }
    ];

    return { maxHr: max, zones: zoneDefs };
  }, [numAge]);

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      padding: '22px 24px',
      boxShadow: 'var(--shadow-sm)',
      textAlign: 'left',
      transition: 'background-color 0.3s ease, border-color 0.3s ease'
    }}>
      {/* Collapsible Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🧮</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
              Fitness Calculators
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              BMI, TDEE Calories & Target Heart Rate Zones
            </span>
          </div>
        </div>

        <button 
          type="button" 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px'
          }}
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: '18px' }}>
          {/* Controls Strip: Tabs & Unit Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'bmi', label: '⚖️ BMI' },
                { id: 'tdee', label: '🍎 Calories' },
                { id: 'heart_rate', label: '❤️ Heart Rate' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-card-subtle)',
                    color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                    border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Metric / Imperial Unit Toggle */}
            <button
              type="button"
              onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {unitSystem === 'metric' ? '🌐 Metric (kg/cm)' : '🇺🇸 Imperial (lbs/in)'}
            </button>
          </div>

          {/* Common Biometric Inputs Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '10px',
            marginBottom: '16px'
          }}>
            {/* Age */}
            <div>
              <label style={labelStyle}>Age</label>
              <input
                type="number"
                min="10"
                max="110"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Gender */}
            <div>
              <label style={labelStyle}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={inputStyle}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label style={labelStyle}>Height ({unitSystem === 'metric' ? 'cm' : 'inches'})</label>
              {unitSystem === 'metric' ? (
                <input
                  type="number"
                  min="50"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  style={inputStyle}
                />
              ) : (
                <input
                  type="number"
                  min="20"
                  max="100"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  placeholder="e.g. 70"
                  style={inputStyle}
                />
              )}
            </div>

            {/* Weight */}
            <div>
              <label style={labelStyle}>Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})</label>
              {unitSystem === 'metric' ? (
                <input
                  type="number"
                  min="20"
                  max="300"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  style={inputStyle}
                />
              ) : (
                <input
                  type="number"
                  min="40"
                  max="700"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  placeholder="e.g. 155"
                  style={inputStyle}
                />
              )}
            </div>
          </div>

          {/* TAB 1: BMI CALCULATOR */}
          {activeTab === 'bmi' && (
            <div>
              <div style={{
                backgroundColor: 'var(--bg-card-subtle)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                  Your Body Mass Index (BMI)
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: bmiColor, lineHeight: '1.1' }}>
                  {bmi}
                </div>
                <div style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: 'var(--bg-card)',
                  color: bmiColor,
                  border: `1px solid ${bmiColor}`
                }}>
                  {bmiCategory}
                </div>

                {healthyWeightRange && (
                  <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    🎯 Ideal healthy weight for your height: <strong>{healthyWeightRange}</strong>
                  </div>
                )}
              </div>

              {/* WHO Range Legend */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center', fontSize: '10px' }}>
                <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '600' }}>
                  &lt; 18.5<br />Under
                </div>
                <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: 'var(--success-light)', color: 'var(--success-text)', fontWeight: '600' }}>
                  18.5–24.9<br />Normal
                </div>
                <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: 'var(--warning-light)', color: 'var(--warning-text)', fontWeight: '600' }}>
                  25–29.9<br />Over
                </div>
                <div style={{ padding: '4px', borderRadius: '4px', backgroundColor: 'var(--danger-light)', color: 'var(--danger-text)', fontWeight: '600' }}>
                  30+<br />Obese
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BMR & TDEE CALORIES */}
          {activeTab === 'tdee' && (
            <div>
              {/* Activity Level Selector */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Weekly Activity Routine</label>
                <select
                  value={activityFactor}
                  onChange={(e) => setActivityFactor(Number(e.target.value))}
                  style={{ ...inputStyle, width: '100%' }}
                >
                  {ACTIVITY_LEVELS.map(lvl => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label} — {lvl.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calorie Targets Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div style={targetBoxStyle}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
                    🛡️ Maintenance
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
                    {tdee.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>kcal / day</div>
                </div>

                <div style={targetBoxStyle}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--warning)' }}>
                    📉 Fat Loss
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--warning)', marginTop: '2px' }}>
                    {fatLossTarget.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>-500 kcal deficit</div>
                </div>

                <div style={targetBoxStyle}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--success-text)' }}>
                    📈 Muscle Gain
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)', marginTop: '2px' }}>
                    {muscleGainTarget.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>+300 kcal surplus</div>
                </div>
              </div>

              <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Basal Metabolic Rate (BMR at total rest): <strong>{bmr.toLocaleString()} kcal/day</strong>
              </div>
            </div>
          )}

          {/* TAB 3: HEART RATE TRAINING ZONES */}
          {activeTab === 'heart_rate' && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                fontSize: '12px'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Max Heart Rate:</span>
                <span style={{ fontWeight: '800', color: 'var(--danger)', fontSize: '14px' }}>
                  {maxHr} BPM
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {zones.map((z, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'var(--bg-card-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>
                        {z.name}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {z.desc}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: z.color }}>
                        {z.min} – {z.max} <span style={{ fontSize: '10px' }}>BPM</span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>
                        {z.pct}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  marginBottom: '4px'
};

const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '13px',
  backgroundColor: 'var(--bg-card)',
  color: 'var(--text-main)'
};

const targetBoxStyle = {
  backgroundColor: 'var(--bg-card-subtle)',
  border: '1px solid var(--border-color)',
  borderRadius: '10px',
  padding: '10px 12px',
  textAlign: 'center'
};

export default FitnessCalculator;
