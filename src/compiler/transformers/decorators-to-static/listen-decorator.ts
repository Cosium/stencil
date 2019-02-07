import * as d from '@declarations';
import { buildError, buildWarn } from '@utils';
import { convertValueToLiteral, createStaticGetter, getDeclarationParameters, isDecoratorNamed } from '../transform-utils';
import ts from 'typescript';


export function listenDecoratorsToStatic(diagnostics: d.Diagnostic[], decoratedMembers: ts.ClassElement[], newMembers: ts.ClassElement[]) {
  const listeners = decoratedMembers
    .filter(ts.isMethodDeclaration)
    .map(method => parseListenDecorators(diagnostics, method));

  const flatListeners = listeners.reduce((arr, listener) => {
    if (listener) {
      arr.push(...listener);
    }
    return arr;
  }, []);

  if (flatListeners.length > 0) {
    newMembers.push(createStaticGetter('listeners', convertValueToLiteral(flatListeners)));
  }
}


function parseListenDecorators(diagnostics: d.Diagnostic[], method: ts.MethodDeclaration) {
  const listenDecorators = method.decorators.filter(isDecoratorNamed('Listen'));
  if (listenDecorators.length === 0) {
    return null;
  }

  return listenDecorators.map(listenDecorator => {
    const methodName = method.name.getText();
    const [ listenText, listenOptions ] = getDeclarationParameters<string, d.ListenOptions>(listenDecorator);

    const eventNames = listenText.split(',');
    if (eventNames.length > 1) {
      const err = buildError(diagnostics);
      err.messageText = 'Please use multiple @Listen() decorators instead of comma-separated names.';
    }

    return parseListener(diagnostics, eventNames[0], listenOptions, methodName);
  });
}


export function parseListener(diagnostics: d.Diagnostic[], eventName: string, opts: d.ListenOptions = {}, methodName: string) {
  let rawEventName = eventName.trim();
  let target = opts.target;

  // DEPRECATED: handle old syntax (`TARGET:event`)
  if (!target) {
    const splt = eventName.split(':');
    const prefix = splt[0].toLowerCase().trim();
    if (splt.length > 1 && isValidTargetValue(prefix)) {
      rawEventName = splt[1].trim();
      target = prefix;
      const warn = buildWarn(diagnostics);
      warn.messageText = `Deprecated @Listen() feature. Use @Listen('${rawEventName}', { target: '${prefix}' }) instead.`;
    }
  }

  // DEPRECATED: handle keycode syntax (`event:KEY`)
  const [finalEvent, keycode, rest] = rawEventName.split('.');
  if (rest === undefined && isValidKeycodeSuffix(keycode)) {
    rawEventName = finalEvent;
    const warn = buildError(diagnostics);
    warn.messageText = `Deprecated @Listen() feature. Using key is not longer supported, use "event.key" instead.`;
  }

  const listener: d.ComponentCompilerListener = {
    name: rawEventName,
    method: methodName,
    target,
    capture: (typeof opts.capture === 'boolean') ? opts.capture : false,
    passive: (typeof opts.passive === 'boolean') ? opts.passive :
      // if the event name is kown to be a passive event then set it to true
      (PASSIVE_TRUE_DEFAULTS.has(rawEventName.toLowerCase())),
    disabled: (opts.enabled === false)
  };
  return listener;
}

export function isValidTargetValue(prefix: string): prefix is d.ListenTargetOptions  {
  return (VALID_ELEMENT_REF_PREFIXES.has(prefix));
}

export function isValidKeycodeSuffix(prefix: string) {
  return (VALID_KEYCODE_SUFFIX.has(prefix));
}

const PASSIVE_TRUE_DEFAULTS = new Set([
  'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
  'mouseenter', 'mouseover', 'mousemove', 'mousedown', 'mouseup', 'mouseleave', 'mouseout', 'mousewheel',
  'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave',
  'resize',
  'scroll',
  'touchstart', 'touchmove', 'touchend', 'touchenter', 'touchleave', 'touchcancel',
  'wheel',
]);

const VALID_ELEMENT_REF_PREFIXES = new Set([
  'parent', 'body', 'document', 'window'
]);

const VALID_KEYCODE_SUFFIX = new Set([
  'enter', 'escape', 'space', 'tab', 'up', 'right', 'down', 'left'
]);
