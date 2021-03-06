<?php


/* ***************** *\
*  ADMIN PAGES        *
\* ***************** */


/**
* @author Martin Scholz
*/
function wisski_textanly_admin_analyse_regexp($op, $ap) {

  switch ($op) {

    case 'edit':

      drupal_load('module', 'wisski_pathbuilder');
      include_once(drupal_get_path('module', 'wisski_pathbuilder') . '/wisski_pathbuilder.inc');

      //for pb_group: display every top group of the import PB section
      $pb_groups = array();
      foreach (wisski_pathbuilder_getEnabledGroups(3) as $id) {
        $info = wisski_pathbuilder_getPathData($id);
        if ($info['group_id'] < 1) $pb_groups["$id"] = $info['name'];
      }

      if (!$ap->settings) {
        $ap->settings = array(
            'class' => '',
        );
      }

      $fieldset = array();
      $fieldset['class'] = array(
          '#type' => 'select',
          '#title' => t('group regexp'),
          '#multiple' => false,
          '#options' => $pb_groups,
          '#default_value' =>  $ap->settings['class'],
          );
      $fieldset['pattern'] = array(
          '#type' => 'textfield',
          '#title' => t('pattern'),
          '#default_value' => $ap->settings['pattern'],
          );  
      $fieldset['rank_offset'] = array(
          '#type' => 'textfield',
          '#title' => t('rank offset'),
          '#default_value' => $ap->settings['rank_offset'],
          );
      $fieldset['rank_length_factor'] = array(
          '#type' => 'textfield',
          '#title' => t('rank length factor'),
          '#default_value' => $ap->settings['rank_length_factor'],
          );          
      return $fieldset;     

    case 'key_info':
      return array(
        'input' => array(
          'text',
        ),
        'output' => array(
          'annos',
        )
      );

    default:

      return NULL;

  }

}



/* ***************** *
*  ANALYSER
** ***************** */



/** Find annotations that match a regex
* This is the analyse operation for analysis component type wisski_textanly_regexp
* 
*
* @author Martin Scholz
*
*/
function _wisski_textanly_analyse_regexp($analyser, $text_struct, $ticket) {
  
  if (!isset($text_struct['annos'])) $text_struct['annos'] = array();

  if (!isset($settings['pattern']) || !isset($settings['class'])) return array();
  $pattern = $settings['pattern'];
  $class = $settings['class'];
  $rank_offset = isset($settings['rank_offset']) ? $settings['rank_offset'] : 1;
  $rank_length_factor = isset($settings['rank_length_factor']) ? $settings['rank_length_factor'] : 0.1;

  if (preg_match_all("/$pattern/u", $text, $matches, PREG_PATTERN_ORDER | PREG_OFFSET_CAPTURE)) {

    foreach ($matches[0] as $match) {

      $start = $match[1];
      $len = mb_strlen($match[0]);
      $end = $start + $len;

      $anno = array(
          'class' => $class,
          'range' => array($start, $end),
          'rank' => $rank_offset + ($len * $rank_length_factor),
          );
      $text_struct['annos'][] = $anno;

    }

  }

  return $text_struct;

}


