$ErrorActionPreference = 'Stop'
$docxPath = (Resolve-Path '.').Path + '\docs\informe-PC2.docx'
$pdfPath = (Resolve-Path '.').Path + '\.docx-render\informe-PC2.pdf'
New-Item -ItemType Directory -Force -Path (Split-Path $pdfPath) | Out-Null

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$sel = $word.Selection

function Add-Text([string]$text, [string]$style = 'Normal') {
  $styleId = switch ($style) { 'Title' { -63 } 'Subtitle' { -75 } 'Heading 1' { -2 } 'Heading 2' { -3 } default { -1 } }
  $sel.Style = $styleId
  $sel.TypeText($text)
  $sel.TypeParagraph()
}

function Add-Bullets([string[]]$items) {
  foreach ($item in $items) {
    $sel.Style = -1
    $sel.Range.ListFormat.ApplyBulletDefault()
    $sel.TypeText($item)
    $sel.TypeParagraph()
  }
  $sel.Range.ListFormat.RemoveNumbers()
}

function Add-Table([string[]]$headers, [object[][]]$rows) {
  $range = $sel.Range
  $table = $doc.Tables.Add($range, $rows.Count + 1, $headers.Count)
  $table.Borders.Enable = 1
  $table.AllowAutoFit = $true
  for ($c = 1; $c -le $headers.Count; $c++) {
    $cell = $table.Cell(1, $c)
    $cell.Range.Text = $headers[$c - 1]
    $cell.Range.Bold = 1
    $cell.Range.Font.Color = 16777215
    $cell.Shading.BackgroundPatternColor = 7889955
  }
  for ($r = 0; $r -lt $rows.Count; $r++) {
    for ($c = 0; $c -lt $headers.Count; $c++) {
      $table.Cell($r + 2, $c + 1).Range.Text = [string]$rows[$r][$c]
      if (($r % 2) -eq 1) { $table.Cell($r + 2, $c + 1).Shading.BackgroundPatternColor = 15592941 }
    }
  }
  $sel.SetRange($table.Range.End, $table.Range.End)
  $sel.TypeParagraph()
}

$doc.PageSetup.TopMargin = $word.InchesToPoints(0.7)
$doc.PageSetup.BottomMargin = $word.InchesToPoints(0.7)
$doc.PageSetup.LeftMargin = $word.InchesToPoints(0.8)
$doc.PageSetup.RightMargin = $word.InchesToPoints(0.8)
$doc.Styles.Item(-1).Font.Name = 'Aptos'
$doc.Styles.Item(-1).Font.Size = 10.5

$sel.ParagraphFormat.Alignment = 1
Add-Text 'Informe final PC2' 'Title'
Add-Text 'Mascotas y salubridad en Lima Norte' 'Subtitle'
Add-Text "Proyecto Final de Carrera III`nCierre técnico y de seguridad`n20 de noviembre de 2026" 'Normal'
$sel.ParagraphFormat.Alignment = 0
Add-Text 'Conclusión' 'Heading 1'
Add-Text 'El incremento PC2 fue fusionado en main, superó CI, CodeQL y controles de seguridad, y fue publicado por Vercel. Las pruebas de RLS con dos ciudadanos y un fiscalizador verificaron aislamiento, permisos municipales y persistencia. La prueba final de Storage rechazó el borrado de una fotografía privada ajena y conservó el objeto.'

Add-Text '1 Resultado de entrega' 'Heading 1'
Add-Table @('Elemento','Resultado') @(
  @('Repositorio','github.com/ann0912/pfc3-examen'),
  @('PR PC2','#5 fusionado'),
  @('Commit de main','804424e97ff79321d7a133cb983649afcc82d39f'),
  @('GitHub Actions','Run 44695736671 aprobado'),
  @('Producción','https://pfc3-examen.vercel.app/ — HTTP 200'),
  @('Supabase','pqgfhgpeilncwyoyymgq')
)

Add-Text '2 Funcionalidad implementada' 'Heading 1'
Add-Bullets @(
  'Registro e inicio de sesión mediante Supabase Auth.',
  'Registro y consulta de mascotas asociadas al propietario.',
  'Creación de reportes con código, estado, ubicación, fotografía y persistencia.',
  'Mapa público con ubicación aproximada y datos mínimos.',
  'Panel municipal por rol, asignaciones, inspecciones, estados e historial.',
  'Indicadores y filtros de reportes para operación municipal.'
)

Add-Text '3 Arquitectura efectiva' 'Heading 1'
Add-Text 'El navegador ejecuta un frontend estático HTML, CSS y JavaScript desplegado en Vercel. El cliente usa supabase-js con URL y clave publicable para Auth, REST y Storage. PostgreSQL conserva perfiles, mascotas, reportes, roles, asignaciones, inspecciones, historial, notificaciones y metadatos de fotografías. RLS decide el acceso con auth.uid() y roles municipales. No existe un backend propio ni se expone service_role en el frontend.'
Add-Table @('Capa','Tecnología','Responsabilidad') @(
  @('Presentación','HTML CSS JavaScript Leaflet','Formularios, mapa, paneles y validación'),
  @('Plataforma','Vercel','Build estático y publicación de main'),
  @('Servicios','Supabase Auth REST Storage','Sesiones, API y archivos privados'),
  @('Datos','PostgreSQL RLS','Persistencia relacional y autorización'),
  @('DevSecOps','GitHub Actions CodeQL Gitleaks','Controles antes del deploy')
)

Add-Text '4 Seguridad Supabase' 'Heading 1'
Add-Text 'Las nueve tablas expuestas de public tienen RLS habilitado. La migración 202611200004_function_privileges.sql retiró la ejecución pública de rls_auto_enable, conservó el trigger DDL y fijó search_path seguro. has_municipal_role permanece disponible para authenticated porque las políticas la requieren y solo consulta el rol de auth.uid().'
Add-Text 'La migración 202611200005_public_map_security_invoker.sql reemplazó la vista con privilegios del definidor por una vista security_invoker sobre una caché mínima. Solo publica código, distrito, categoría, estado, fecha, coordenadas redondeadas y una referencia genérica.'
Add-Table @('Control','Evidencia','Resultado') @(
  @('Aislamiento ciudadano','A y B consultaron únicamente recursos propios','Aprobado'),
  @('Modificación ajena','Seis intentos cruzados afectaron cero filas','Aprobado'),
  @('Rol fiscalizador','Reporte asignado, inspección e historial persistentes','Aprobado'),
  @('Storage privado','DELETE ajeno HTTP 400; objeto original presente','Aprobado'),
  @('Mapa público','Anon solo accedió a caché mínima','Aprobado')
)

Add-Text '5 Pruebas y CI CD' 'Heading 1'
Add-Table @('Verificación','Resultado') @(
  @('Tests Node','12 de 12 aprobadas'),
  @('Lint','Aprobado'),
  @('Typecheck','Aprobado; sintaxis JavaScript'),
  @('Build','Aprobado con configuración pública de Supabase'),
  @('npm audit','Cero vulnerabilidades'),
  @('Security','Patrones prohibidos y Gitleaks aprobados'),
  @('CodeQL','Análisis JavaScript aprobado'),
  @('Deploy','Aprobado sobre main 804424e')
)
Add-Text 'El dominio de producción respondió HTTP 200. En producción se observó una sesión real de prueba1@test.com con la mascota Robyn, el reporte LN-00000002, estado Atendido y notificaciones persistentes.'

Add-Text '6 Scrum y trazabilidad' 'Heading 1'
Add-Text 'Jira muestra SCRUM-9 a SCRUM-24 como Finalizadas. El estado administrativo no elimina dos limitaciones: SCRUM-9 quedó condicionado por el rate limit de correos de Supabase y SCRUM-17 no dispone de una interfaz integral para administrar funcionarios; el alta inicial y ciertos cambios de roles continúan realizándose manualmente en Supabase.'

Add-Text '7 Limitaciones y pendientes' 'Heading 1'
Add-Bullets @(
  'has_municipal_role debe seguir ejecutable por authenticated porque las políticas RLS la invocan y la función limita la consulta a auth.uid().',
  'La protección contra contraseñas filtradas requiere Supabase Pro y activación en Authentication Settings.',
  'Las migraciones se aplicaron por SQL Editor y no existe supabase_migrations.schema_migrations; no deben reaplicarse por un historial CLI vacío.',
  'GitHub muestra una advertencia futura por runtime Node.js 20 de algunas Actions; los jobs actuales aprobaron y el pipeline no se modificó.'
)

Add-Text '8 Enlaces de evidencia' 'Heading 1'
Add-Text "Repositorio: https://github.com/ann0912/pfc3-examen`nPR: https://github.com/ann0912/pfc3-examen/pull/5`nActions: https://github.com/ann0912/pfc3-examen/actions/runs/44695736671`nProducción: https://pfc3-examen.vercel.app/`nJira: https://anelis-pfc3.atlassian.net/jira/software/projects/SCRUM"

$doc.SaveAs2($docxPath, 16)
$doc.ExportAsFixedFormat($pdfPath, 17)
$pageCount = $doc.ComputeStatistics(2)
$doc.Close()
$word.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
Write-Output $docxPath
Write-Output $pdfPath
Write-Output "Pages: $pageCount"
