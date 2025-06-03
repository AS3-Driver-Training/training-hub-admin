import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Plot from "react-plotly.js";
import { AnalyticsData } from "@/types/analytics";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useProcessedMarkdown } from "@/hooks/useProcessedMarkdown";

interface ExerciseAnalysisChartsProps {
  studentData: AnalyticsData['student_performance_data'];
  exerciseData: AnalyticsData['anthropic_response']['exercise_breakdown'];
}

export function ExerciseAnalysisCharts({ studentData, exerciseData }: ExerciseAnalysisChartsProps) {
  // Process AI analysis content
  const processedSlalomContent = useProcessedMarkdown(exerciseData.slalom?.content || '');
  const processedBarricadeContent = useProcessedMarkdown(exerciseData.barricade_evasion?.content || '');

  // Sort students by overall score for consistent ordering
  const sortedStudents = [...studentData].sort((a, b) => b.overall_score - a.overall_score);
  const studentNames = sortedStudents.map(s => s.name);

  // Calculate performance statistics using correct field mappings
  const slalomGroupAverage = Math.round(sortedStudents.reduce((sum, s) => {
    const slalomControl = s.slalom_max || s.slalom_control || 0;
    return sum + slalomControl;
  }, 0) / sortedStudents.length);
  
  const evasionGroupAverage = Math.round(sortedStudents.reduce((sum, s) => {
    const evasionControl = s.lane_change_max || s.evasion_control || 0;
    return sum + evasionControl;
  }, 0) / sortedStudents.length);
  
  // Calculate attempts averages using correct field mappings
  const slalomAttemptsAverage = Math.round(sortedStudents.reduce((sum, s) => {
    const attempts = s.s_runs_until_pass || s.slalom_attempts || 0;
    return sum + attempts;
  }, 0) / sortedStudents.length);
  
  const evasionAttemptsAverage = Math.round(sortedStudents.reduce((sum, s) => {
    const attempts = s.lc_runs_until_pass || s.evasion_attempts || 0;
    return sum + attempts;
  }, 0) / sortedStudents.length);

  // Get top 3 performers for each exercise using correct field mappings
  const slalomTopPerformers = [...sortedStudents]
    .sort((a, b) => {
      const aControl = a.slalom_max || a.slalom_control || 0;
      const bControl = b.slalom_max || b.slalom_control || 0;
      if (aControl !== bControl) {
        return bControl - aControl;
      }
      const aAttempts = a.s_runs_until_pass || a.slalom_attempts || 0;
      const bAttempts = b.s_runs_until_pass || b.slalom_attempts || 0;
      return aAttempts - bAttempts;
    })
    .slice(0, 3);

  const evasionTopPerformers = [...sortedStudents]
    .sort((a, b) => {
      const aControl = a.lane_change_max || a.evasion_control || 0;
      const bControl = b.lane_change_max || b.evasion_control || 0;
      if (aControl !== bControl) {
        return bControl - aControl;
      }
      const aAttempts = a.lc_runs_until_pass || a.evasion_attempts || 0;
      const bAttempts = b.lc_runs_until_pass || b.evasion_attempts || 0;
      return aAttempts - bAttempts;
    })
    .slice(0, 3);

  // Static exercise descriptions
  const slalomDescription = `The Slalom exercise may seem basic, but it is the most demanding of all activities. This test creates a consistent skill that involves a deep understanding of time/distance and hand/eye coordination. Its consistency allows us to measure it precisely to determine driver skill and focus areas; this is the basis for everything we train in evasive driving.

The Slalom exercise requires that the student maintains a consistent speed above 80% of the car's lateral acceleration capability while negotiating through the turns. The students must perform the exercise without hitting cones and maintaining a constant speed (a 4 mile an hour variation will invalidate the test); this involves learning where to look and anticipate turns while controlling the throttle to counter the drag to sustain speed.

Type: Regular Slalom – 4 Cones (50ft Chord)
Difficulty Level: Medium / Hard`;

  const evasionDescription = `Based on the research published by the Society of Automotive Engineers, in this exercise, students are pushed to the limits of cognitive reaction times through an electronically operated signal system that allows them little room for error. The Barricade requires situational awareness and decision-making while using all the skills acquired in the Slalom, adding a psychological factor as the speed through the exercise is slightly increased.

Just as the Slalom, this exercise requires skill as it is graded at 80% of the car's lateral acceleration capability and requires the same speed consistency as stated above.

Type: Regular LnCh – .75 Sec Reaction time (100ft Chord)
Difficulty Level: Medium`;

  // Chart configuration
  const createChartData = (exercise: 'slalom' | 'evasion') => {
    const controlData = exercise === 'slalom' ? 
      sortedStudents.map(s => s.slalom_max || s.slalom_control || 0) : 
      sortedStudents.map(s => s.lane_change_max || s.evasion_control || 0);
    
    const attemptsData = exercise === 'slalom' ? 
      sortedStudents.map(s => s.s_runs_until_pass || s.slalom_attempts || 0) : 
      sortedStudents.map(s => s.lc_runs_until_pass || s.evasion_attempts || 0);

    return [
      {
        type: 'scatter' as const,
        mode: 'markers' as const,
        x: studentNames,
        y: controlData,
        marker: {
          size: 14,
          color: '#DC2626',
          symbol: 'circle' as const,
          line: { color: '#FFFFFF', width: 2 }
        },
        name: 'Max Performance %',
        hovertemplate: '<b>%{x}</b><br>Max Performance: %{y}%<extra></extra>',
        yaxis: 'y' as const
      },
      {
        type: 'scatter' as const,
        mode: 'markers' as const,
        x: studentNames,
        y: attemptsData,
        marker: {
          size: 12,
          color: '#6B7280',
          symbol: 'square' as const,
          line: { color: '#FFFFFF', width: 1 }
        },
        name: 'Attempts Until Pass',
        hovertemplate: '<b>%{x}</b><br>Attempts: %{y}<extra></extra>',
        yaxis: 'y2' as const
      }
    ];
  };

  const createChartLayout = (title: string, maxAttempts: number) => ({
    title: {
      text: title,
      font: { size: 18, color: '#1f2937', family: 'Inter, sans-serif' }
    },
    xaxis: {
      title: { text: 'Students', font: { color: '#374151', family: 'Inter, sans-serif' } },
      showgrid: false,
      tickangle: -45,
      tickfont: { family: 'Inter, sans-serif', size: 11 }
    },
    yaxis: {
      title: { text: 'Performance %', font: { color: '#DC2626', family: 'Inter, sans-serif' } },
      side: 'left' as const,
      range: [0, 100],
      showgrid: true,
      gridcolor: '#f8fafc',
      gridwidth: 1,
      tickfont: { family: 'Inter, sans-serif' }
    },
    yaxis2: {
      title: { text: 'Number of Attempts', font: { color: '#6B7280', family: 'Inter, sans-serif' } },
      side: 'right' as const,
      overlaying: 'y' as const,
      range: [0, maxAttempts + 2],
      showgrid: false,
      tickfont: { family: 'Inter, sans-serif' }
    },
    shapes: [{
      type: 'line' as const,
      x0: 0,
      x1: 1,
      xref: 'paper' as const,
      y0: 80,
      y1: 80,
      yref: 'y' as const,
      line: { color: '#F59E0B', width: 2, dash: 'dash' as const },
      layer: 'below' as const
    }],
    annotations: [
      {
        x: 0.02,
        y: 82,
        xref: 'paper' as const,
        yref: 'y' as const,
        text: '80% Performance Threshold',
        showarrow: false,
        font: { color: '#F59E0B', size: 12, family: 'Inter, sans-serif' }
      }
    ],
    margin: { l: 80, r: 100, t: 60, b: 120 },
    height: 450,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    showlegend: false,
    font: { family: 'Inter, sans-serif' }
  });

  const config = {
    displayModeBar: false,
    responsive: true
  };

  const markdownComponents = {
    p: ({ children }) => <p className="mb-4 text-sm leading-relaxed text-gray-700">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
    h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-4 text-gray-900">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-semibold mt-6 mb-3 text-gray-900">{children}</h3>,
    h4: ({ children }) => <h4 className="text-base font-semibold mt-4 mb-2 text-gray-900">{children}</h4>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="mb-1 text-sm leading-relaxed text-gray-700">{children}</li>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">{children}</blockquote>,
    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
    pre: ({ children }) => <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-4">{children}</pre>
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Exercise Performance Analysis</CardTitle>
        <div className="text-sm text-gray-600">
          Individual student performance across core training exercises. Red dots show maximum performance achieved, grey squares show attempts until passing.
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Slalom Exercise Section */}
        <div className="space-y-4">
          {/* Static Slalom Description */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="slalom" className="border border-blue-200 rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-blue-900">SLALOM EXERCISE</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="prose prose-sm prose-blue max-w-none">
                  <div className="whitespace-pre-line text-gray-700">{slalomDescription}</div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* AI Analysis for Slalom */}
          {exerciseData.slalom && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h4 className="font-semibold text-blue-900 mb-3">AI Analysis: {exerciseData.slalom.title}</h4>
              <div className="space-y-4">
                <ReactMarkdown 
                  remarkPlugins={[remarkBreaks, remarkGfm]}
                  components={markdownComponents}
                >
                  {processedSlalomContent}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Slalom Chart */}
          <Plot
            data={createChartData('slalom')}
            layout={createChartLayout('Slalom Exercise Performance', Math.max(...sortedStudents.map(s => s.s_runs_until_pass || s.slalom_attempts || 0)))}
            config={config}
            style={{ width: '100%', height: '450px' }}
          />
          
          {/* Slalom Performance Summary */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-blue-900">Slalom Performance Summary</h4>
                <div className="text-sm text-blue-700">
                  Group Average: {slalomGroupAverage}% | Avg Attempts: {slalomAttemptsAverage}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {slalomTopPerformers.map((student, index) => {
                  const control = student.slalom_max || student.slalom_control || 0;
                  const attempts = student.s_runs_until_pass || student.slalom_attempts || 0;
                  return (
                    <div key={student.name} className="bg-white rounded p-3 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-blue-900">{student.name}</div>
                          <div className="text-sm text-blue-700">{control}% control, {attempts} attempts</div>
                        </div>
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Barricade Evasion Section */}
        <div className="space-y-4">
          {/* Static Evasion Description */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="evasion" className="border border-green-200 rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-green-900">BARRICADE EVASION (Lane Change)</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="prose prose-sm prose-green max-w-none">
                  <div className="whitespace-pre-line text-gray-700">{evasionDescription}</div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* AI Analysis for Barricade Evasion */}
          {exerciseData.barricade_evasion && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <h4 className="font-semibold text-green-900 mb-3">AI Analysis: {exerciseData.barricade_evasion.title}</h4>
              <div className="space-y-4">
                <ReactMarkdown 
                  remarkPlugins={[remarkBreaks, remarkGfm]}
                  components={markdownComponents}
                >
                  {processedBarricadeContent}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Evasion Chart */}
          <Plot
            data={createChartData('evasion')}
            layout={createChartLayout('Barricade Evasion Exercise Performance', Math.max(...sortedStudents.map(s => s.lc_runs_until_pass || s.evasion_attempts || 0)))}
            config={config}
            style={{ width: '100%', height: '450px' }}
          />
          
          {/* Evasion Performance Summary */}
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-green-900">Barricade Evasion Performance Summary</h4>
                <div className="text-sm text-green-700">
                  Group Average: {evasionGroupAverage}% | Avg Attempts: {evasionAttemptsAverage}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {evasionTopPerformers.map((student, index) => {
                  const control = student.lane_change_max || student.evasion_control || 0;
                  const attempts = student.lc_runs_until_pass || student.evasion_attempts || 0;
                  return (
                    <div key={student.name} className="bg-white rounded p-3 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-green-900">{student.name}</div>
                          <div className="text-sm text-green-700">{control}% control, {attempts} attempts</div>
                        </div>
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart Legend */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Chart Legend & Performance Standards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Chart Elements</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>Red dots = Maximum performance achieved</li>
                <li>• <span className="inline-block w-3 h-3 bg-gray-500 mr-2"></span>Grey squares = Attempts until pass</li>
                <li>• <span className="inline-block w-3 h-0.5 bg-orange-400 mr-2"></span>Orange line = 80% performance threshold</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Performance Standards</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 80%+ Performance: Proficient in exercise</li>
                <li>• Fewer attempts: Faster skill acquisition</li>
                <li>• Consistent speed: Critical for safety</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
