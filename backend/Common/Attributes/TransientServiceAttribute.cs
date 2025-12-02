namespace backend.Common.Attributes;

[AttributeUsage(AttributeTargets.Class, Inherited = false, AllowMultiple = false)]
public sealed class TransientServiceAttribute : Attribute { }
